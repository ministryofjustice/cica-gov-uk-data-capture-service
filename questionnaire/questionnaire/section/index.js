'use strict';

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

    function createSimpleAttribute(attributeId, attributeSchema, data, includeMetadata) {
        const value = data[attributeId];
        const valueLabel = getValueLabel(attributeSchema, value);
        const simpleAttribute = {
            id: attributeId,
            type: 'simple',
            label: attributeSchema.title
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
                        includeMetadata
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
            if (allOf[0].meta !== undefined) {
                // The page is a composite question
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
            // The page is an allOf with conditionals
            allOf[0].allOf.forEach(subSchema => {
                const attributeId = Object.keys(subSchema.properties)[0];
                const questionSchema = subSchema.properties[attributeId];

                if (questionSchema !== undefined) {
                    const attribute = createSimpleAttribute(
                        attributeId,
                        questionSchema,
                        data,
                        includeMetadata
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

        return [];
    }

    return Object.freeze({
        getAttributesByData,
        getSchema
    });
}

module.exports = createSection;
