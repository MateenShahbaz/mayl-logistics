import React, { useState } from "react";
import Button from "../ui/button/Button";

const VerificationForm = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto"></div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Verified Email
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter a code send to your email to verfied a email
            </p>
          </div>
          <div className="">
            <div className="otp-container">
              <form className="otp-form">
                <div className="otp-input-container">
                  {otp.map((digit, index) => {
                    return (
                      <input
                        id={`otp-input-${index}`}
                        type="text"
                        // maxLength="1"
                        key={index}
                        value={digit}
                        // onChange={(e) => handleChange(e.target.value, index)}
                        // onKeyDown={(e) => handleKeyDown(e, index)}
                        className="otp-input"
                      />
                    );
                  })}
                </div>
                {/* <button type="submit" className="verify-button">
                  Verify OTP
                </button> */}
                <Button className="w-full" size="sm">
                    Sign in
                  </Button>
              </form>
              <button
                type="button"
                // onClick={handleResendCode}
                className="resend-button"
                // disabled={!isResendEnabled}
              >
                {/* {isResendEnabled
                  ? t("resend_otp")
                  : t("resend_in_seconds", { count: resendTimer })} */}
                  resend_otp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationForm;
