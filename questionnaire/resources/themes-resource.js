'use strict';

module.exports = {
    data: [
        {
            type: 'theme',
            id: 'applicant_details',
            title: 'Your details',
            values: [
                {
                    type: 'simple',
                    id: 'q-applicant-fatal-claim',
                    title: 'Are you applying for someone who died from their injuries?',
                    closedQuestion: true,
                    themeId: 'applicant_details',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-applicant-fatal-claim'
                },
                {
                    type: 'simple',
                    id: 'q--was-the-crime-reported-to-police',
                    title: 'Was the crime reported to the police?',
                    closedQuestion: true,
                    themeId: 'applicant_details',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p--was-the-crime-reported-to-police'
                },
                {
                    type: 'composite',
                    id: 'applicant-name',
                    title: 'Enter your name',
                    themeId: 'applicant_details',
                    values: [
                        {
                            type: 'simple',
                            id: 'q-applicant-title',
                            title: 'Title',
                            closedQuestion: false,
                            themeId: 'applicant_details',
                            value: 'Mr'
                        },
                        {
                            type: 'simple',
                            id: 'q-applicant-first-name',
                            title: 'First name',
                            closedQuestion: false,
                            themeId: 'applicant_details',
                            value: 'Foo'
                        },
                        {
                            type: 'simple',
                            id: 'q-applicant-last-name',
                            title: 'Last name',
                            closedQuestion: false,
                            themeId: 'applicant_detailsdg',
                            value: 'Bar'
                        }
                    ],
                    sectionId: 'p-applicant-enter-your-name'
                },
                {
                    type: 'simple',
                    id: 'q-police-force-id',
                    title: 'Which police force is investigating the crime?',
                    closedQuestion: true,
                    themeId: 'applicant_details',
                    value: 10000133,
                    valueLabel: 'Police Scotland North East',
                    sectionId: 'p--which-police-force-is-investigating-the-crime'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-physical-injuries',
                    title: 'Select any injuries to the foot',
                    closedQuestion: true,
                    themeId: 'applicant_details',
                    value: ['phyinj-118', 'phyinj-119', 'phyinj-149'],
                    valueLabel: ['Broken foot', 'Broken heel', 'Other'],
                    sectionId: 'p-applicant-physical-injury-legs-foot'
                }
            ]
        },
        {
            type: 'theme',
            id: 'default',
            title: 'Catch all theme',
            values: [
                {
                    type: 'simple',
                    id: 'q-applicant-has-crime-reference-number',
                    title: 'Do you have a crime reference number?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-has-crime-reference-number'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-who-are-you-applying-for',
                    title: 'Who are you applying for?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: 'myself',
                    valueLabel: 'Myself',
                    sectionId: 'p-applicant-who-are-you-applying-for'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-are-you-18-or-over',
                    title: 'Are you 18 or over?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-are-you-18-or-over'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-british-citizen-or-eu-national',
                    title: 'Are you a British citizen or EU national?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-british-citizen-or-eu-national'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-confirmation-method',
                    title: "How should we tell you we've got your application?",
                    closedQuestion: true,
                    themeId: 'default',
                    value: 'email',
                    valueLabel: 'Email',
                    sectionId: 'p-applicant-confirmation-method'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-enter-your-email-address',
                    title: 'Email address',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'foo@dfasfasdfasdfasdf.gov.uk',
                    sectionId: 'p-applicant-confirmation-method'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-have-you-been-known-by-any-other-names',
                    title: 'Have you ever been known by any other names?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-applicant-have-you-been-known-by-any-other-names'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-enter-your-date-of-birth',
                    title: 'Enter your date of birth',
                    closedQuestion: false,
                    themeId: 'default',
                    value: '1970-01-01T00:00:00.000Z',
                    sectionId: 'p-applicant-enter-your-date-of-birth'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-postcode',
                    title: 'Postcode (optional)',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'G2 8DU',
                    sectionId: 'p-applicant-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-county',
                    title: 'County (optional)',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'Glasgow',
                    sectionId: 'p-applicant-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-building-and-street',
                    title: 'Building and street',
                    closedQuestion: false,
                    themeId: 'default',
                    value: '1 test Lane',
                    sectionId: 'p-applicant-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-town-or-city',
                    title: 'Town or city',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'Testertown',
                    sectionId: 'p-applicant-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-enter-your-telephone-number',
                    title: 'Enter your telephone number',
                    closedQuestion: false,
                    themeId: 'default',
                    value: '12345678901',
                    sectionId: 'p-applicant-enter-your-telephone-number'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-incident-type',
                    title: 'What led to your injuries?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: 'ANIMAL',
                    valueLabel: 'Animal attack',
                    sectionId: 'p-applicant-incident-type'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-did-the-crime-happen-once-or-over-time',
                    title: 'Did the crime happen once or over a period of time?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: 'once',
                    valueLabel: 'Once',
                    sectionId: 'p-applicant-did-the-crime-happen-once-or-over-time'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-when-did-the-crime-happen',
                    title: 'When did the crime happen?',
                    closedQuestion: false,
                    themeId: 'default',
                    value: '2021-01-01T00:00:00.000Z',
                    sectionId: 'p-applicant-when-did-the-crime-happen'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-where-did-the-crime-happen',
                    title: 'Where did the crime happen?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: 'scotland',
                    valueLabel: 'Scotland',
                    sectionId: 'p-applicant-where-did-the-crime-happen'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-scottish-town-or-city',
                    title: 'Town or city',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'some plave in scotland',
                    sectionId: 'p-applicant-where-in-scotland-did-it-happen'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-scottish-location',
                    title: 'Location',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'a park',
                    sectionId: 'p-applicant-where-in-scotland-did-it-happen'
                },
                {
                    type: 'simple',
                    id: 'q--when-was-the-crime-reported-to-police',
                    title: 'When was the crime reported to the police?',
                    closedQuestion: false,
                    themeId: 'default',
                    value: '2021-01-01T00:00:00.000Z',
                    sectionId: 'p--when-was-the-crime-reported-to-police'
                },
                {
                    type: 'simple',
                    id: 'q--whats-the-crime-reference-number',
                    title: "What's the crime reference number?",
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'crimeRef123456',
                    sectionId: 'p--whats-the-crime-reference-number'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-describe-incident',
                    title: 'Would you like to briefly describe the crime in your own words?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-describe-incident'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-incident-description',
                    title: 'Briefly describe the crime in your own words',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'Dog licked my face in an aggresive manner',
                    sectionId: 'p-applicant-incident-description'
                },
                {
                    type: 'simple',
                    id: 'q-offender-do-you-know-the-name-of-the-offender',
                    title: "Do you know the offender's name?",
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-offender-do-you-know-the-name-of-the-offender'
                },
                {
                    type: 'simple',
                    id: 'q-offender-enter-offenders-name',
                    title: "Enter the offender's name",
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'Max',
                    sectionId: 'p-offender-enter-offenders-name'
                },
                {
                    type: 'simple',
                    id: 'q-offender-do-you-have-contact-with-offender',
                    title: 'Do you have contact with the offender?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-offender-do-you-have-contact-with-offender'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-non-sa-infections',
                    title: 'Do you have HIV or hepatitis as a result of the crime?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-applicant-non-sa-infections'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-pregnancy-loss',
                    title: 'Did you lose a pregnancy as a result of the crime?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-applicant-pregnancy-loss'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-are-you-claiming-for-physical-injuries',
                    title: 'Do you have physical injuries as a result of the crime?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-are-you-claiming-for-physical-injuries'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-physical-injury',
                    title: 'What was injured?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: ['legs'],
                    valueLabel: ['Legs or feet'],
                    sectionId: 'p-applicant-physical-injury'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-physical-injury-legs',
                    title: 'What part of the legs or feet were injured?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: ['ankle', 'foot', 'toes'],
                    valueLabel: ['Ankle', 'Foot', 'Toes'],
                    sectionId: 'p-applicant-physical-injury-legs'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-physical-injuries',
                    title: 'Select any injuries to the ankle',
                    closedQuestion: true,
                    themeId: 'default',
                    value: ['phyinj-116'],
                    valueLabel: ['Sprained ankle'],
                    sectionId: 'p-applicant-physical-injury-legs-ankle'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-physical-injuries-legs-foot-other',
                    title: 'Other foot injuries',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'wet foot',
                    sectionId: 'p-applicant-physical-injury-legs-foot'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-physical-injuries',
                    title: 'What parts of the toes were injured?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: ['phyinj-130'],
                    valueLabel: ['Broken toe'],
                    sectionId: 'p-applicant-physical-injury-legs-toes'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-do-you-have-disabling-mental-injury',
                    title: 'Do you have a disabling mental injury?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-applicant-do-you-have-disabling-mental-injury'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-affect-on-daily-life-dmi',
                    title: 'Briefly say how the crime has affected your daily life',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'I hate dogs',
                    sectionId: 'p-applicant-affect-on-daily-life-dmi'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-treatment-for-physical-injuries',
                    title: 'What treatment are you receiving for your physical injuries?',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'Foot doc',
                    sectionId: 'p-applicant-treatment-for-physical-injuries'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-has-your-treatment-finished-dmi',
                    title: 'Have you finished your treatment?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-has-your-treatment-finished-dmi'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-are-you-registered-with-gp',
                    title: 'Are you registered with a GP practice?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-are-you-registered-with-gp'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-have-you-seen-a-gp',
                    title: 'Have you seen a GP about your injuries?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-have-you-seen-a-gp'
                },
                {
                    type: 'simple',
                    id: 'q-gp-postcode',
                    title: 'Postcode (optional)',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'G3 7TY',
                    sectionId: 'p-gp-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-gp-building-and-street',
                    title: 'Practice name',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'Doctor Foot Inc',
                    sectionId: 'p-gp-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-gp-building-and-street2',
                    title: 'Building and street',
                    closedQuestion: false,
                    themeId: 'default',
                    value: '1 Foot Lane',
                    sectionId: 'p-gp-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-gp-county',
                    title: 'County (optional)',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'Lanarkshire',
                    sectionId: 'p-gp-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-gp-town-or-city',
                    title: 'Town or city',
                    closedQuestion: false,
                    themeId: 'default',
                    value: 'Glasgow',
                    sectionId: 'p-gp-enter-your-address'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-unable-to-work-duration',
                    title: 'Have you been unable to work for more than 28 weeks?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-unable-to-work-duration'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-job-when-crime-happened',
                    title: 'Did you have a job when the crime happened?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: true,
                    valueLabel: 'Yes',
                    sectionId: 'p-applicant-job-when-crime-happened'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-expenses',
                    title: 'What expenses have you had?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: ['aids', 'alterations', 'home-care', 'treatment'],
                    valueLabel: [
                        'Buying or repairing physical aids',
                        'Alterations to my home',
                        'Home care',
                        "NHS treatment I've paid for"
                    ],
                    sectionId: 'p-applicant-expenses'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-have-you-applied-to-us-before',
                    title: 'Have you applied to us before?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-applicant-have-you-applied-to-us-before'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-have-you-applied-for-or-received-any-other-compensation',
                    title: 'Have you applied for or received any other form of compensation?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-applicant-have-you-applied-for-or-received-any-other-compensation'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-applied-for-other-compensation-briefly-explain-why-not',
                    title:
                        'Briefly explain why you have not applied for or received any other form of compensation',
                    closedQuestion: false,
                    themeId: 'default',
                    value: "I didn't know it was an option",
                    sectionId: 'p-applicant-applied-for-other-compensation-briefly-explain-why-not'
                },
                {
                    type: 'simple',
                    id: 'q-applicant-provide-additional-information',
                    title: 'Would you like to add any information to your claim?',
                    closedQuestion: true,
                    themeId: 'default',
                    value: false,
                    valueLabel: 'No',
                    sectionId: 'p-applicant-provide-additional-information'
                }
            ]
        }
    ]
};
