'use strict';

const pointer = require('jsonpointer');

function createSection({id, sectionDefinition}) {
    function getId() {
        return id;
    }

    function getSchema() {
        return sectionDefinition.schema;
    }

    function getAttributeFormat(attributeSchema) {
        if ('format' in attributeSchema) {
            const format = {
                value: attributeSchema.format
            };

            return format;
        }

        return undefined;
    }

    function getAttributeMetadata(attributeSchema) {
        const sectionId = getId();
        const meta = {sectionId};
        const attributeMeta = attributeSchema.meta;
        const format = getAttributeFormat(attributeSchema);

        if (attributeMeta !== undefined) {
            Object.assign(meta, attributeMeta);
        }

        if (format !== undefined) {
            meta.keywords = meta.keywords || {};

            if ('format' in meta.keywords) {
                const formatMetadata = meta.keywords.format;

                meta.keywords.format = {...format, ...formatMetadata};
            } else {
                meta.keywords.format = format;
            }
        }

        return meta;
    }

    function getCompositeAttributeId(attributeSchema) {
        return attributeSchema.meta.compositeId;
    }

    function getAttributeSchemaTitle(attributeSchemas, value) {
        const foundAttributeSchema = attributeSchemas.find(
            attributeSchema => attributeSchema.const === value
        );

        return foundAttributeSchema.title;
    }

    function getAttributeSchemaTitles(attributeSchemas, values) {
        return values.map(value => getAttributeSchemaTitle(attributeSchemas, value));
    }

    function getAttributeSchemaDescribedBy(attributeSchemas, value, sectionSchema) {
        const foundAttributeSchema = attributeSchemas.find(
            attributeSchema => attributeSchema.const === value
        );
        const describedBy = foundAttributeSchema?.meta?.describedBy;
        if (describedBy && '$ref' in describedBy) {
            const describedByPointerValue = pointer.get(
                sectionSchema,
                foundAttributeSchema?.meta?.describedBy.$ref
            );
            if (describedByPointerValue === undefined) {
                return '';
            }
            return describedByPointerValue;
        }
        return foundAttributeSchema?.meta?.describedBy;
    }

    function getValueLabel(attributeSchema, value) {
        const {oneOf, anyOf, items} = attributeSchema;

        if (oneOf !== undefined) {
            return getAttributeSchemaTitle(oneOf, value);
        }

        if (anyOf !== undefined) {
            return getAttributeSchemaTitle(anyOf, value);
        }

        if (items !== undefined) {
            return getAttributeSchemaTitles(items.anyOf, value);
        }

        return undefined;
    }

    function getLabel(attributeSchema, value, sectionSchema) {
        const {oneOf, anyOf, items} = attributeSchema;

        if (oneOf !== undefined) {
            return getAttributeSchemaDescribedBy(oneOf, value, sectionSchema);
        }

        if (anyOf !== undefined) {
            return getAttributeSchemaDescribedBy(anyOf, value, sectionSchema);
        }

        if (items !== undefined) {
            return getAttributeSchemaDescribedBy(items.anyOf, value, sectionSchema);
        }

        return attributeSchema.title;
    }

    function createSimpleAttribute(
        attributeId,
        attributeSchema,
        data,
        includeMetadata,
        sectionSchema
    ) {
        const value = data[attributeId];
        const valueLabel = getValueLabel(attributeSchema, value);
        const label = getLabel(attributeSchema, value, sectionSchema);
        const simpleAttribute = {
            id: attributeId,
            type: 'simple',
            label
        };

        if (value !== undefined) {
            simpleAttribute.value = value;
        }

        if (valueLabel !== undefined) {
            simpleAttribute.valueLabel = valueLabel;
        }

        if (includeMetadata === true) {
            const meta = getAttributeMetadata(attributeSchema);

            if (meta !== undefined) {
                simpleAttribute.meta = meta;
            }
        }

        return simpleAttribute;
    }

    function createCompositeAttribute(compositeAttributeSchema, includeMetadata) {
        const compositeAttribute = {
            id: getCompositeAttributeId(compositeAttributeSchema),
            type: 'composite',
            label: compositeAttributeSchema.title,
            values: []
        };

        if (includeMetadata === true) {
            const meta = getAttributeMetadata(compositeAttributeSchema);

            if (meta !== undefined) {
                compositeAttribute.meta = meta;
            }
        }

        return compositeAttribute;
    }

    function getAttributesByData({
        data = {},
        includeMetadata = false,
        mapAttribute,
        schema = getSchema()
    }) {
        const {properties, allOf} = schema;
        const attributes = [];

        if (properties !== undefined) {
            Object.keys(data).forEach(attributeId => {
                const questionSchema = properties[attributeId];

                if (questionSchema !== undefined) {
                    const attribute = createSimpleAttribute(
                        attributeId,
                        questionSchema,
                        data,
                        includeMetadata,
                        schema
                    );

                    if (mapAttribute !== undefined) {
                        attributes.push(mapAttribute(attribute));
                    } else {
                        attributes.push(attribute);
                    }
                }
            });

            return attributes;
        }

        if (allOf !== undefined) {
            const compositeAttributeSchema = allOf[0];
            const compositeAttribute = createCompositeAttribute(
                compositeAttributeSchema,
                includeMetadata
            );

            compositeAttributeSchema.allOf.forEach(subSchema => {
                compositeAttribute.values.push(
                    ...getAttributesByData({
                        data,
                        includeMetadata,
                        mapAttribute,
                        schema: subSchema
                    })
                );
            });

            if (mapAttribute !== undefined) {
                attributes.push(mapAttribute(compositeAttribute));
            } else {
                attributes.push(compositeAttribute);
            }

            return attributes;
        }

        return [];
    }

    return Object.freeze({
        getAttributesByData,
        getSchema
    });
}

module.exports = createSection;
