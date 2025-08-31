/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  IconButton,
  TextField,
  Drawer,
  Typography,
  Button,
  FormHelperText,
  Autocomplete,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { CountryCode, getCountryCallingCode } from "libphonenumber-js";
import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { ErrorResponse } from "@/lib/types/error_type";
import { OrderType } from "@/lib/types/enums";
import { fetchPlaceByPostalCode } from "@/lib/api/fetchPlaceByPostalCode";
import { fetchStreetsByPostalCode } from "@/lib/api/fetchStreetsByPostalCode";
import PhoneInput from "./PhoneInput";

interface AddressInput {
  buildingNumber: string;
  street: string;
  town: string;
  pincode: string;
  addressType: string;
}

interface AddressFormProps {
  onSubmit: (values: {
    userInfo: UserInfo;
    orderType: OrderType;
    address?: AddressInput;
  }) => void;
  isOpen: boolean;
  onClose: () => void; // onClose function to close the drawer
  address: any;
  error: ErrorResponse | null;
  setFormError: (values: ErrorResponse) => void;
  formValues: any;
  isDelivery: boolean;
  onToggleDelivery: () => void;
}

export interface UserInfo {
  name: string;
  phoneNumber: string;
}

const buttonTextMap = {
  delivery: "SAVE ADDRESS & PROCEED",
  pickup: "CONFIRM & PROCEED",
};

const AddNewAddress: React.FC<AddressFormProps> = ({
  onSubmit,
  isOpen,
  onClose,
  address,
  error,
  setFormError,
  formValues,
  isDelivery,
  onToggleDelivery,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [selectedCountry] = useState<CountryCode>("DE");
  const [name, setUserName] = React.useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>(""); // Phone number for sign-up
  const [buildingNumber, setBuildingNumber] = React.useState("");
  const [street, setStreet] = React.useState<string>("");
  const [town, setTown] = React.useState("");
  const [pincode, setPincode] = React.useState<string>("");
  const [addressType, setAddressType] = React.useState("");
  const [currentFormError, setCurrentFormError] = React.useState<ErrorResponse>([]);
  const [streetOptions, setStreetOptions] = useState<string[]>([]);
  const orderType = isDelivery ? OrderType.DELIVERY : OrderType.PICKUP;
  useEffect(() => {

    const hasCustomerDetails =
      formValues &&
      Object.keys(formValues).length > 0;

    if (hasCustomerDetails) {
      const customer = formValues;
      setUserName(customer.name || "");
      setPhoneNumber(customer.phoneNumber || "");
      if (customer.address && Object.keys(customer.address).length > 0) {
        setTown(customer.address.town || "");
        setBuildingNumber(customer.address.buildingNumber || "");
        setStreet(customer.address.street || "");
        setPincode(customer.address.pincode || "");
        setAddressType(customer.address.addressType?.toLowerCase() || "home");
      }
    } else if (address) {
      setStreet(address.road || "");
      setPincode(address.postcode || "");
      setBuildingNumber(address.house_number || "");
      setTown(
        address.city ||
          address.town ||
          address.city_district ||
          address.village ||
          ""
      );
    }
  }, [formValues, address]);

  const handlePostalCodeChange = async (value: string): Promise<void> => {
    setPincode(value);
    if (value.length === 5) {
      const pinCodeArea = await fetchPlaceByPostalCode(value); // Fetch place and streets when postal code is complete
      if (pinCodeArea && pinCodeArea.length > 0) {
        //             setTown(formValues.customerDetails.address.town || "");
        setTown(pinCodeArea[0]["place name"] || "");
        const streets = await fetchStreetsByPostalCode(value);
        setStreetOptions(streets);
        setCurrentFormError((prev) =>
          prev.filter((error) => error.key !== "pincode")
        );
      } else {
        setTown("");
        setStreetOptions([]);
        setCurrentFormError([
          {
            key: "pincode",
            message: "Invalid pincode. Please enter correct pincode",
          },
        ]);
      }
    } else {
      setTown("");
      setStreet("");
      setBuildingNumber("");
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault(); // Prevent default form submission behavior
    try {
      if (orderType === OrderType.DELIVERY) {
        await onSubmit({
          userInfo: {
            name,
            phoneNumber: `+${getCountryCallingCode(
              selectedCountry
            )}${phoneNumber}`,
          },
          orderType: orderType,
          address: {
            buildingNumber,
            street,
            town,
            pincode,
            addressType: addressType.toUpperCase(),
          },
        });
      } else {
        await onSubmit({
          userInfo: {
            name,
            phoneNumber: `+${getCountryCallingCode(
              selectedCountry
            )}${phoneNumber}`,
          },
          orderType: orderType,
        });
      }
      // Call the passed function for form submission
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const getErrorMessage = (key: string) => {
    if (error && error.length == 0) {
      return currentFormError?.find((err) => err.key === key)?.message || null;
    } else {
      return error?.find((err) => err.key === key)?.message || null;
    }
  };

  return (
    <Drawer
      anchor={isMobile ? "bottom" : "right"}
      open={isOpen}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: "100%",
          maxWidth: "400px",
          height: "100%",
        },
      }}
    >
      <div className="w-full p-6 relative">
        {/* Close button */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={onClose}
          sx={{ position: "absolute", top: 20, right: 20 }}
        >
          <CloseIcon />
        </IconButton>

        {/* Input fields */}
        <div className="px-10">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
            <button
              onClick={() => onToggleDelivery()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                !isDelivery
                  ? "bg-white  text-[#f97316] shadow-md"
                  : "text-gray-900 hover:text-gray-900"
              }`}
            >
              <StorefrontIcon fontSize="small" />
              Collection
            </button>
            <button
              onClick={() => onToggleDelivery()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                isDelivery
                  ? "bg-white text-[#f97316] shadow-md"
                  : "text-gray-900 hover:text-gray-900"
              }`}
            >
              <DeliveryDiningIcon fontSize="small" />
              Delivery
            </button>
          </div>

          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setUserName(e.target.value)}
            className="mb-4"
            required
            error={!!getErrorMessage("name")}
            helperText={getErrorMessage("name")}
          />
          <div className="my-4">
            <PhoneInput
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              selectedCountry={selectedCountry}
            />
            {getErrorMessage("phoneNumber") && (
              <FormHelperText error>
                {getErrorMessage("phoneNumber")}
              </FormHelperText>
            )}
          </div>
          {orderType === OrderType.DELIVERY && (
            <>
              <TextField
                label="Pincode"
                variant="outlined"
                fullWidth
                value={pincode}
                onChange={(e) => handlePostalCodeChange(e.target.value)}
                sx={{ marginBottom: 1 }}
                required
                error={!!getErrorMessage("pincode")}
                helperText={getErrorMessage("pincode")} // Show error for email
              />
              {pincode.length < 5 && (
                <Typography
                  variant="caption"
                  sx={{ color: "primary.main", mb: 0.5 }}
                >
                  Enter pincode to unlock this field
                </Typography>
              )}

              {pincode.length >= 5 && !!getErrorMessage("pincode") && (
                <Typography
                  variant="caption"
                  sx={{ color: "primary.main", mb: 0.5 }}
                >
                  Enter correct pincode to unlock this field
                </Typography>
              )}
              <TextField
                label="Building No."
                variant="outlined"
                fullWidth
                value={buildingNumber}
                onChange={(e) => setBuildingNumber(e.target.value)}
                sx={{ marginBottom: 1 }}
                required
                slotProps={{
                  input: {
                    readOnly: pincode.length < 5,
                  },
                }}
                error={!!getErrorMessage("buildingNumber")}
                helperText={getErrorMessage("buildingNumber")} // Show error for email
              />
              {pincode.length < 5 && (
                <Typography
                  variant="caption"
                  sx={{ color: "primary.main", mb: 0.5 }}
                >
                  Enter pincode to unlock this field
                </Typography>
              )}

              {pincode.length >= 5 && !!getErrorMessage("pincode") && (
                <Typography
                  variant="caption"
                  sx={{ color: "primary.main", mb: 0.5 }}
                >
                  Enter correct pincode to unlock this field
                </Typography>
              )}
              <Autocomplete
                freeSolo
                options={streetOptions}
                inputValue={street}
                onInputChange={(event, newInputValue) =>
                  setStreet(newInputValue)
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Street"
                    variant="outlined"
                    fullWidth
                    required
                    inputProps={{
                      ...params.inputProps,
                      readOnly: pincode.length < 5, // ✅ Make it readonly conditionally
                    }}
                    error={!!getErrorMessage("street")}
                    helperText={getErrorMessage("street")}
                    sx={{ marginBottom: 1 }}
                  />
                )}
              />
              {pincode.length < 5 && (
                <Typography
                  variant="caption"
                  sx={{ color: "primary.main", mb: 0.5 }}
                >
                  Enter pincode to unlock this field
                </Typography>
              )}

              {pincode.length >= 5 && !!getErrorMessage("pincode") && (
                <Typography
                  variant="caption"
                  sx={{ color: "primary.main", mb: 0.5 }}
                >
                  Enter correct pincode to unlock this field
                </Typography>
              )}
              <TextField
                label="City or Town"
                variant="outlined"
                fullWidth
                value={town}
                onChange={(e) => setTown(e.target.value)}
                sx={{ marginBottom: 1 }}
                required
                error={!!getErrorMessage("town")}
                helperText={getErrorMessage("town")}
                slotProps={{
                  input: {
                    readOnly: pincode.length < 5,
                  },
                }}
              />
            </>
          )}

          {/* Submit Button */}
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={(event) => {
              handleSubmit(event);
              setFormError([]);
            }}
            sx={{
              height: "46px",
              marginTop: "12px",
              borderRadius: "50px",
              background: "#FF6347",
            }}
          >
            {orderType
              ? buttonTextMap[
                  orderType.toLowerCase() as keyof typeof buttonTextMap
                ]
              : "PROCEED"}
          </Button>
        </div>
      </div>
    </Drawer>
  );
};

export default AddNewAddress;
