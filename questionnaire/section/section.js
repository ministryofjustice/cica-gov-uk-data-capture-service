'use strict';

function createSection({sectionDefinition}) {
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

    function getAttributesByData(data = {}, schema = sectionDefinition.schema) {
        const {properties, allOf} = schema;
        const attributes = [];

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

            compositeAttributeSchema.allOf.forEach(subSchema => {
                compositeAttribute.values.push(...getAttributesByData(data, subSchema));
            });

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
