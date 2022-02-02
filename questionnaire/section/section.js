'use strict';

const $RefParser = require('json-schema-ref-parser');
const replaceJsonPointers = require('../../services/replace-json-pointer/index');

function createSection({sectionDefinition, answers}) {
    function getAttributeFormat(attributeSchema) {
        if ('format' in attributeSchema) {
            const format = {
                value: attributeSchema.format
            };

            if (
                'meta' in attributeSchema &&
                'keywords' in attributeSchema.meta &&
                'format' in attributeSchema.meta.keywords
            ) {
                const formatMetadata = attributeSchema.meta.keywords.format;

                return {...format, ...formatMetadata};
            }

            return format;
        }

        return undefined;
    }

    function getCompositeAttributeId(attributeSchema) {
        return attributeSchema.meta.compositeId;
    }

    function getAttributeLabel(valueSchemas, value) {
        const foundValueSchema = valueSchemas.find(valueSchema => valueSchema.const === value);

        return foundValueSchema.title;
    }

    function getAttributeLabels(valueSchemas, values) {
        return values.map(value => getAttributeLabel(valueSchemas, value));
    }

    function getValueLabel(attributeSchema, value) {
        const {oneOf, items} = attributeSchema;

        if (oneOf !== undefined) {
            return getAttributeLabel(oneOf, value);
        }

        if (items !== undefined) {
            return getAttributeLabels(items.anyOf, value);
        }

        return undefined;
    }

    function createSimpleAttribute(id, attributeSchema, data) {
        const format = getAttributeFormat(attributeSchema);
        const value = data[id];
        const valueLabel = getValueLabel(attributeSchema, value);
        const simpleAttribute = {
            id,
            type: 'simple',
            label: attributeSchema.title
        };

        if (format !== undefined) {
            simpleAttribute.format = format;
        }

        if (value !== undefined) {
            simpleAttribute.value = value;
        }

        if (valueLabel !== undefined) {
            simpleAttribute.valueLabel = valueLabel;
        }

        return simpleAttribute;
    }

    function createCompositeAttribute(compositeAttributeSchema) {
        const compositeAttribute = {
            id: getCompositeAttributeId(compositeAttributeSchema),
            type: 'composite',
            label: compositeAttributeSchema.title,
            values: []
        };

        return compositeAttribute;
    }

    async function getDescribedByRefValue(questionId, schema) {
        const schemaObj = await $RefParser.dereference(schema);
        return schemaObj.allOf[1].properties[questionId].meta.describedBy;
    }

    async function createDescribedByAttribute(questionId, schema, questionnaireAnswers = answers) {
        const {allOf} = schema;
        const questionTitle = allOf[1].properties[questionId].title;

        const attribute = {
            id: questionId,
            type: 'simple',
            label: schema.title ? schema.title : '',
            value: `${replaceJsonPointers(await getDescribedByRefValue(questionId, schema), {
                answers: questionnaireAnswers
            })} ${questionTitle || ''}`
        };

        return attribute;
    }

    // TODO add in a gist reference to the target shape here.
    function isDescribedBy(questionId, schema) {
        if ('allOf' in schema) {
            const {allOf} = schema;
            if (
                allOf[1] &&
                allOf[1].properties &&
                allOf[1].properties[questionId] &&
                allOf[1].properties[questionId].meta &&
                allOf[1].properties[questionId].meta.describedBy
            ) {
                return true;
            }
        }
        return false;
    }

    function getDescribedById(data = {}, schema) {
        const {allOf} = schema;
        if (allOf !== undefined) {
            return Object.keys(data).find(questionId => {
                if (isDescribedBy(questionId, schema)) {
                    return true;
                }
                return false;
            });
        }
        return undefined;
    }

    async function getAttributesByData(data = {}, schema = sectionDefinition.schema) {
        const {properties, allOf} = schema;
        const attributes = [];

        const describedById = getDescribedById(data, schema);

        if (describedById !== undefined) {
            attributes.push(await createDescribedByAttribute(describedById, schema));
            return attributes;
        }

        if (properties !== undefined) {
            Object.keys(data).forEach(attributeId => {
                const questionSchema = properties[attributeId];

                if (questionSchema !== undefined) {
                    const attribute = createSimpleAttribute(attributeId, questionSchema, data);

                    attributes.push(attribute);
                }
            });

            return attributes;
        }

        if (allOf !== undefined) {
            const compositeAttributeSchema = allOf[0];
            const compositeAttribute = createCompositeAttribute(compositeAttributeSchema);

            await compositeAttributeSchema.allOf.reduce(async (previousPromise, subSchema) => {
                // const attArray = await previousPromise;
                const attribute = await getAttributesByData(data, subSchema);
                compositeAttribute.values.push(...attribute);
                // return attArray;
            }, Promise.resolve([]));
            attributes.push(compositeAttribute);
            return attributes;
        }

        return [];
    }

    return Object.freeze({
        getAttributesByData
    });
}

module.exports = createSection;
