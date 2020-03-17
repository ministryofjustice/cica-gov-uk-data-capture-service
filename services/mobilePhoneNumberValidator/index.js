'use strict';

// https://javadoc.io/static/com.googlecode.libphonenumber/libphonenumber/8.8.0/com/google/i18n/phonenumbers/PhoneNumberUtil.PhoneNumberType.html
// https://github.com/ruimarinho/google-libphonenumber/issues/92
const phoneNumberUtil = require('google-libphonenumber').PhoneNumberUtil;
const phoneNumberType = require('google-libphonenumber').PhoneNumberType;
const phoneNumberFormat = require('google-libphonenumber').PhoneNumberFormat;

function createValidatorService() {
    function isValidMobilePhoneNumber(input) {
        try {
            const phoneUtil = phoneNumberUtil.getInstance();
            const number = phoneUtil.parse(input, 'GB');
            phoneUtil.format(number, phoneNumberFormat.INTERNATIONAL);
            if (phoneUtil.isValidNumber(number)) {
                const inputtedPhoneNumberType = phoneUtil.getNumberType(number);
                if (inputtedPhoneNumberType === phoneNumberType.MOBILE) {
                    return true;
                }
            }
        } catch (err) {
            return false;
        }
        return false;
    }

    return Object.freeze({
        isValidMobilePhoneNumber
    });
}

module.exports = createValidatorService;
