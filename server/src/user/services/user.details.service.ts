import { OrderType } from "../../models/enums";
import { CustomerInfo } from "../../models/types/order-customer-info";
import validator from "validator";
import ApiResponse from "../../utils/ApiResponse";
import { fetchLocationApi } from "../../external-api/fetchLocationApi";
import { AddressLocation } from "../../models/types/address-location";
import { isValidAddress } from "../../utils/isValidAddress";
import { IAddress } from "../../models/types/address";
import fetch from "node-fetch"; // or use 'axios' if you prefer
import UserInfo from "../models/user-details.model";
import { UserRepository } from "../repository/user.repository";
import {
  Customer,
  CustomerDetails,
  DeliveryDetails,
} from "../../models/types/customer-details";

export class UserDetailsService {
  private readonly repository = new UserRepository();
  async create(deviceId: string, tid: string, model: CustomerInfo) {
    const errors:{key:string,message:string}[] = [];
    if (model.name == "" || model.phoneNumber == "") {
      const isNameGiven = model.name.trim().length > 0;
      const isPhoneNumberGiven = model.phoneNumber.trim().length > 0;

      if (!isNameGiven) {
        errors.push({ key: "name", message: "Please enter the name" });
      }
      if (!isPhoneNumberGiven) {
        errors.push({
          key: "phoneNumber",
          message: "Please enter the phone number",
        });
      }
    }

    const normalizedPhone = model.phoneNumber.startsWith("+")
      ? model.phoneNumber
      : `+49${model.phoneNumber}`;
    if (
      !normalizedPhone ||
      !validator.isMobilePhone(normalizedPhone, "de-DE")
    ) {
      errors.push({
        key: "phoneNumber",
        message: "Valid German phone number is required.",
      });
    }

    if (errors.length > 0 && model.orderType === OrderType.PICKUP) {
      return new ApiResponse(400, errors, "Validation failed.");
    }

    if (
      model.orderType === OrderType.DELIVERY &&
      model.address &&
      Object.keys(model.address).length
    ) {
      const addressFields: (keyof IAddress)[] = [
        "pincode",
        "buildingNumber",
        "town",
        "street",
        "displayAddress",
      ];

      addressFields.forEach((field) => {
        if (!model.address[field as keyof IAddress]) {
          errors.push({ key: field, message: `${field} is required.` });
        }
      });

      const isValidPincode = /^\d{5}$/.test(model.address.pincode.trim());
      if (!isValidPincode) {
        errors.push({ key: "pincode", message: "Invalid pincode." });
      }

      // 2. Validate buildingNumber: Check if it's alphanumeric or numeric
      const isValidBuildingNumber = /^[a-zA-Z0-9\s]+$/.test(
        model.address.buildingNumber.trim()
      );

      if (!isValidBuildingNumber) {
        errors.push({
          key: "buildingNumber",
          message: "Invalid buildingNumber.",
        });
      }

      // 3. Validate street: Should contain alphabetic characters, spaces, and hyphens (for streets like "Maximilianstraße")
      const isValidStreet = /^[a-zA-ZäöüßÄÖÜ0-9\s\-]+$/.test(
        model.address.street.trim()
      );

      if (!isValidStreet) {
        errors.push({ key: "isValidStreet", message: "Invalid street." });
      }
      // 4. Validate town: Should contain alphabetic characters, spaces, and hyphens

      if (
        model.address.pincode &&
        model.address.buildingNumber &&
        model.address.street &&
        model.address.town
      ) {
        const location: AddressLocation[] = await fetchLocationApi(
          model.address.displayAddress
        );
        const isValid = isValidAddress(location);
        if (location && !isValid && errors.length == 0) {
          const locationError = [
            { key: "town", message: "Please check the town name" },
            { key: "street", message: "Please check the street name." },
            { key: "pincode", message: "Please check the pincode" },
          ];
          errors.concat(locationError);
        }
      }
    }

    if (errors.length > 0) {
      return new ApiResponse(400, errors, "Validation failed.");
    }

    let userInformation = await UserInfo.findOne({
      deviceId: deviceId,
      tid: tid,
    });

    if (userInformation && Object.keys(userInformation).length > 0) {
      userInformation.name = model.name;
      userInformation.phoneNumber = model.phoneNumber;
      if (model.orderType === OrderType.DELIVERY) {
        userInformation.address = model.address;
        userInformation.orderMethod = model.orderType;
      }
      // Update existing user info
    } else {
      userInformation = new UserInfo({
        name: model.name,
        phoneNumber: model.phoneNumber,
        ...(model.orderType === OrderType.DELIVERY && {
          address: model.address,
        }),
        deviceId: deviceId,
        tid: tid,
        orderType:
          model.orderType === OrderType.DELIVERY ? "DELIVERY" : "PICKUP",
      });
    }

    await userInformation.save();

    if (model.orderType === OrderType.DELIVERY) {
      const webhookUrl = "http://localhost:4000/webhook/delivery-charge";
      const userAddress = model.address.displayAddress;
      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-id": deviceId,
          "x-tid": tid,
        },
        body: JSON.stringify({ address: userAddress }),
      });
    }

    return new ApiResponse<CustomerDetails>(
      201,
      {
        name: userInformation.name,
        phoneNumber: userInformation.phoneNumber,
        address: userInformation?.address ? userInformation.address : {},
      },
      "Customer info created successfully."
    );
  }

  async fetchUserDetails(
    deviceId: string,
    tid: string
  ): Promise<
    ApiResponse<{
      customerDetails: CustomerDetails | null;
      hasAddress: boolean;
    }>
  > {
    const item = await this.findByDeviceIdAndTid(deviceId, tid);

    let hasAddress = false;
    if (item && item.address) {
      // Check if address fields have values (customize as needed)
      hasAddress = Object.values(item).some((v) => !!v && v !== "");
    }

    if (!item) {
      // Use 404 for not found!
      return new ApiResponse(
        200,
        { customerDetails: null, hasAddress: false },
        "No User Found with this device"
      );
    }

    const data: { customerDetails: CustomerDetails; hasAddress: boolean } = {
      customerDetails: {
        name: item.name ?? "",
        phoneNumber: item.phoneNumber ?? "",
        address: item.address ?? ({} as IAddress),
      },
      hasAddress,
    };

    return new ApiResponse(200, data, "Success");
  }

  async fetchUserDeliveryDetails(
    deviceId: string,
    tid: string
  ): Promise<ApiResponse<DeliveryDetails | null>> {
    const item = await this.findByDeviceIdAndTid(deviceId, tid);

    if (!item) {
      // Use 404 for not found!
      return new ApiResponse(200, null, "No User Found with this device");
    }

    const data: DeliveryDetails = {
      orderType: item.orderType,
      deliverable: item.deliverable ?? false,
      isFreeDelivery: item.isFreeDelivery ?? false,
      deliveryFee: item.deliveryFee ?? 0,
      userLocation: item.userLocation,
    };

    return new ApiResponse(200, data, "Success");
  }

  private async findByDeviceIdAndTid(
    deviceId: string,
    tid: string
  ): Promise<Customer | null> {
    return await this.repository.findByDeviceId(deviceId, tid);
  }
}
