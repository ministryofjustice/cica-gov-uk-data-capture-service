'use strict';

function getDependentQuestionIds(questionId, sortingInstructions) {
    const questionOrdering = sortingInstructions.questions
        ? sortingInstructions.questions[questionId]
        : sortingInstructions[questionId];
    return questionOrdering || [];
}

function dependentsInIncorrectOrder(values, valueIndex, sortingInstructions) {
    if (valueIndex === 0) {
        return false;
    }
    const currentQuestionId = values[valueIndex].id;
    const previousQuestionId = values[valueIndex - 1].id;
    const dependentIds = getDependentQuestionIds(currentQuestionId, sortingInstructions);
    return dependentIds.includes(previousQuestionId);
}

function sortThemedAnswers(themeContent, sortingInstructions) {
    themeContent.forEach(theme => {
        if (theme.type === 'theme') {
            const values = theme.values || [];
            if (values.length > 0) {
                values.forEach((value, valueIndex) => {
                    if (dependentsInIncorrectOrder(values, valueIndex, sortingInstructions)) {
                        [values[valueIndex], values[valueIndex - 1]] = [
                            values[valueIndex - 1],
                            values[valueIndex]
                        ];
                    }
                });
            }
        }
    });
    return themeContent;
}

function sortThemes(themeContent, sortingInstructions) {
    const themesWithAnswers = sortThemedAnswers(themeContent, sortingInstructions);
    if (!sortingInstructions.sections) {
        return themesWithAnswers;
    }
    const orderMap = new Map();

    sortingInstructions.sections.forEach((id, index) => {
        orderMap.set(id, index);
    });

    return themesWithAnswers.sort((a, b) => {
        const orderA = orderMap.get(a.id);
        const orderB = orderMap.get(b.id);
        return (
            (orderA !== undefined ? orderA : Number.MAX_VALUE) -
            (orderB !== undefined ? orderB : Number.MAX_VALUE)
        );
    });
}

module.exports = sortThemes;
