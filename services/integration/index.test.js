'use strict';

const {transformQuestionnaire} = require('.');
const questionnaireFixture = require('../../questionnaire/test-fixtures/res/questionnaireCompleteForCheckYourAnswers');
const questionnaire = require('../../questionnaire/questionnaire/questionnaire');

describe('Integration Service', () => {
    // Arrange
    const questionnaireObj = questionnaire({questionnaireDefinition: questionnaireFixture});

    // Act
    const result = transformQuestionnaire(questionnaireObj);

    it('Should transform correctly and include the correct CRN in the metadata.', () => {
        expect(result.meta.caseReference).toBe('19\\751194');
    });

    it('Should transform correctly with amalgamated injury codes and labels.', () => {
        const injuries = result.themes
            .find(theme => {
                return theme.id === 'injuries';
            })
            .values.find(question => {
                return question.id === 'q-applicant-physical-injuries';
            });

        expect(injuries.value).toStrictEqual([
            'phyinj-139',
            'phyinj-149',
            'phyinj-026',
            'phyinj-006',
            'phyinj-137',
            'phyinj-083',
            'phyinj-161'
        ]);

        expect(injuries.valueLabel).toStrictEqual([
            'Quadriplegia or tetraplegia (paralysis of all 4 limbs)',
            'Other',
            'Damaged or detached retina',
            'Broken ear bone',
            'Hemiplegia (paralysis of one side of the the body)',
            'Scars',
            'Cartilage'
        ]);
    });

    it('Should transform correctly with the correct declaration.', () => {
        expect(result.declaration.id).toBe('p-applicant-declaration');
        expect(result.declaration.label).toContain('<div id="declaration">');
        expect(result.declaration.value).toBe('i-agree');
        expect(result.declaration.valueLabel).toBe('I have read and understood the declaration');
    });

    it('Should keep hideOnSummary flags.', () => {
        const newOrExistingQuestion = result.themes
            .find(theme => {
                return theme.id === 'about-application';
            })
            .values.find(question => {
                return question.id === 'q--new-or-existing-application';
            });
        expect(newOrExistingQuestion.hideOnSummary).toBeTruthy();
    });
});
