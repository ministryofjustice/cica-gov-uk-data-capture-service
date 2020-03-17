'use strict';

const createValidatorService = require('./index');

describe('validator', () => {
    const validator = createValidatorService();

    it('should validate a GB (by default) mobile number', () => {
        const result = validator.isValidMobilePhoneNumber('07713590327');
        expect(result).toBe(true);
    });

    it('should validate a formatted GB (by default) mobile number', () => {
        const result1 = validator.isValidMobilePhoneNumber('07701 234567');
        const result2 = validator.isValidMobilePhoneNumber('077012 34567');
        const result3 = validator.isValidMobilePhoneNumber('077-012-34567');
        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);
    });

    it('should validate a GB (by default) mobile number with international prefix', () => {
        const result = validator.isValidMobilePhoneNumber('+447701234567');
        expect(result).toBe(true);
    });

    it('should validate a formatted GB (by default) mobile number with international prefix', () => {
        const result1 = validator.isValidMobilePhoneNumber('+44770 1234567');
        const result2 = validator.isValidMobilePhoneNumber('+44 770 1234567');
        const result3 = validator.isValidMobilePhoneNumber('+4477 01234567');
        const result4 = validator.isValidMobilePhoneNumber('+44770-123-4567');
        const result5 = validator.isValidMobilePhoneNumber('+44 770-123-4567');
        expect(result1).toBe(true);
        expect(result2).toBe(true);
        expect(result3).toBe(true);
        expect(result4).toBe(true);
        expect(result5).toBe(true);
    });

    it('should NOT validate a GB landline number', () => {
        const result = validator.isValidMobilePhoneNumber('0141 420 5000');
        expect(result).toBe(false);
    });

    it('should NOT validate a GB landline number with international prefix', () => {
        const result = validator.isValidMobilePhoneNumber('+44141 420 5000');
        expect(result).toBe(false);
    });

    it('should NOT validate a long invalid number', () => {
        const result = validator.isValidMobilePhoneNumber('43276385243685724356423594325');
        expect(result).toBe(false);
    });

    it('should NOT validate a short invalid number', () => {
        const result = validator.isValidMobilePhoneNumber('1');
        expect(result).toBe(false);
    });

    it('should NOT validate a short invalid integer number', () => {
        const result = validator.isValidMobilePhoneNumber(1);
        expect(result).toBe(false);
    });

    it('should NOT validate a string', () => {
        const result = validator.isValidMobilePhoneNumber('notamobilenumber');
        expect(result).toBe(false);
    });

    it('should NOT validate a undefined', () => {
        const result = validator.isValidMobilePhoneNumber();
        expect(result).toBe(false);
    });
});
