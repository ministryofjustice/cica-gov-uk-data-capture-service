'use strict';

const sortThemedAnswers = require('./index');

describe('sort-themed-answers', () => {
    it('should reorder a themed summary according to provided instructions', () => {
        const orderingInstructions = {
            'q-applicant-have-you-been-known-by-any-other-names': [
                'q-applicant-what-other-names-have-you-used'
            ]
        };
        const themedAnswers = [
            {
                type: 'theme',
                id: 'applicant-details',
                title: 'Your details',
                values: [
                    {
                        id: 'q-applicant-date-of-birth',
                        type: 'simple',
                        label: 'Date of birth',
                        value: '1970-01-01T00:00:00.000Z',
                        sectionId: 'p-applicant-date-of-birth',
                        theme: 'applicant-details',
                        format: {
                            precision: 'YYYY-MM-DD',
                            value: 'date-time'
                        }
                    },
                    {
                        id: 'q-applicant-who-are-you-applying-for',
                        type: 'simple',
                        label: 'Who are you applying for?',
                        sectionId: 'p-applicant-who-are-you-applying-for',
                        theme: 'applicant-details',
                        value: 'myself',
                        valueLabel: 'Myself'
                    },
                    {
                        id: 'applicant-name',
                        type: 'composite',
                        label: 'Your name',
                        values: [
                            {
                                id: 'q-applicant-title',
                                type: 'simple',
                                label: 'Title',
                                value: 'Mr',
                                sectionId: 'p-applicant-enter-your-name',
                                theme: 'applicant-details'
                            },
                            {
                                id: 'q-applicant-first-name',
                                type: 'simple',
                                label: 'First name',
                                value: 'Foo',
                                sectionId: 'p-applicant-enter-your-name',
                                theme: 'applicant-details'
                            },
                            {
                                id: 'q-applicant-last-name',
                                type: 'simple',
                                label: 'Last name',
                                value: 'Bar',
                                sectionId: 'p-applicant-enter-your-name',
                                theme: 'applicant-details'
                            }
                        ],
                        sectionId: 'p-applicant-enter-your-name',
                        theme: 'applicant-details'
                    },
                    {
                        id: 'q-applicant-what-other-names-have-you-used',
                        type: 'simple',
                        label: 'What other names have you been known by?',
                        value: 'Mr Test Testcase',
                        sectionId: 'p-applicant-have-you-been-known-by-any-other-names',
                        theme: 'applicant-details'
                    },
                    {
                        id: 'q-applicant-have-you-been-known-by-any-other-names',
                        type: 'simple',
                        label: 'Have you been known by any other names?',
                        value: true,
                        valueLabel: 'Yes',
                        sectionId: 'p-applicant-have-you-been-known-by-any-other-names',
                        theme: 'applicant-details'
                    },
                    {
                        id: 'q-applicant-british-citizen-or-eu-national',
                        type: 'simple',
                        label: 'Mr Foo Bar, are you a British citizen or EU national?',
                        value: true,
                        valueLabel: 'Yes',
                        sectionId: 'p-applicant-british-citizen-or-eu-national',
                        theme: 'applicant-details'
                    }
                ]
            },
            {
                type: 'theme',
                id: 'contact-details',
                title: 'Contact details',
                values: [
                    {
                        id: 'q-applicant-enter-your-email-address',
                        type: 'simple',
                        label: 'Enter your email address',
                        value: 'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk',
                        sectionId: 'p-applicant-enter-your-email-address',
                        theme: 'contact-details',
                        format: {
                            value: 'email'
                        }
                    }
                ]
            },
            {
                type: 'theme',
                id: 'default',
                title: 'Answers',
                values: [
                    {
                        id: 'q-applicant-theme-undefined',
                        type: 'simple',
                        label: 'Enter your fav colour',
                        value: 'red',
                        sectionId: 'p-applicant-theme-undefined'
                    },
                    {
                        id: 'q-applicant-theme-not-found',
                        type: 'simple',
                        label: 'Enter your fav colour',
                        value: 'blue',
                        sectionId: 'p-applicant-theme-not-found',
                        theme: 'this-theme-is-not-found'
                    }
                ]
            }
        ];
        expect(sortThemedAnswers(themedAnswers, orderingInstructions)).toEqual([
            {
                type: 'theme',
                id: 'applicant-details',
                title: 'Your details',
                values: [
                    {
                        id: 'q-applicant-date-of-birth',
                        type: 'simple',
                        label: 'Date of birth',
                        value: '1970-01-01T00:00:00.000Z',
                        sectionId: 'p-applicant-date-of-birth',
                        theme: 'applicant-details',
                        format: {
                            precision: 'YYYY-MM-DD',
                            value: 'date-time'
                        }
                    },
                    {
                        id: 'q-applicant-who-are-you-applying-for',
                        type: 'simple',
                        label: 'Who are you applying for?',
                        sectionId: 'p-applicant-who-are-you-applying-for',
                        theme: 'applicant-details',
                        value: 'myself',
                        valueLabel: 'Myself'
                    },
                    {
                        id: 'applicant-name',
                        type: 'composite',
                        label: 'Your name',
                        values: [
                            {
                                id: 'q-applicant-title',
                                type: 'simple',
                                label: 'Title',
                                value: 'Mr',
                                sectionId: 'p-applicant-enter-your-name',
                                theme: 'applicant-details'
                            },
                            {
                                id: 'q-applicant-first-name',
                                type: 'simple',
                                label: 'First name',
                                value: 'Foo',
                                sectionId: 'p-applicant-enter-your-name',
                                theme: 'applicant-details'
                            },
                            {
                                id: 'q-applicant-last-name',
                                type: 'simple',
                                label: 'Last name',
                                value: 'Bar',
                                sectionId: 'p-applicant-enter-your-name',
                                theme: 'applicant-details'
                            }
                        ],
                        sectionId: 'p-applicant-enter-your-name',
                        theme: 'applicant-details'
                    },
                    {
                        id: 'q-applicant-have-you-been-known-by-any-other-names',
                        type: 'simple',
                        label: 'Have you been known by any other names?',
                        value: true,
                        valueLabel: 'Yes',
                        sectionId: 'p-applicant-have-you-been-known-by-any-other-names',
                        theme: 'applicant-details'
                    },
                    {
                        id: 'q-applicant-what-other-names-have-you-used',
                        type: 'simple',
                        label: 'What other names have you been known by?',
                        value: 'Mr Test Testcase',
                        sectionId: 'p-applicant-have-you-been-known-by-any-other-names',
                        theme: 'applicant-details'
                    },
                    {
                        id: 'q-applicant-british-citizen-or-eu-national',
                        type: 'simple',
                        label: 'Mr Foo Bar, are you a British citizen or EU national?',
                        value: true,
                        valueLabel: 'Yes',
                        sectionId: 'p-applicant-british-citizen-or-eu-national',
                        theme: 'applicant-details'
                    }
                ]
            },
            {
                type: 'theme',
                id: 'contact-details',
                title: 'Contact details',
                values: [
                    {
                        id: 'q-applicant-enter-your-email-address',
                        type: 'simple',
                        label: 'Enter your email address',
                        value: 'bar@9f7b855e-586b-49f0-ac7a-026919732b06.gov.uk',
                        sectionId: 'p-applicant-enter-your-email-address',
                        theme: 'contact-details',
                        format: {
                            value: 'email'
                        }
                    }
                ]
            },
            {
                type: 'theme',
                id: 'default',
                title: 'Answers',
                values: [
                    {
                        id: 'q-applicant-theme-undefined',
                        type: 'simple',
                        label: 'Enter your fav colour',
                        value: 'red',
                        sectionId: 'p-applicant-theme-undefined'
                    },
                    {
                        id: 'q-applicant-theme-not-found',
                        type: 'simple',
                        label: 'Enter your fav colour',
                        value: 'blue',
                        sectionId: 'p-applicant-theme-not-found',
                        theme: 'this-theme-is-not-found'
                    }
                ]
            }
        ]);
    });
});
