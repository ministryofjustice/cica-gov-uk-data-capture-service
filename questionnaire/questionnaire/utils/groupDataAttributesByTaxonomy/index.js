'use strict';

function createGroup(type, id, title) {
    const group = {
        type,
        id,
        title,
        values: []
    };

    return group;
}

function getOrCreateGroup(groupId, groups, taxonomy) {
    const defaultGroupDetails = {
        id: 'default',
        title: 'Answers'
    };
    const {id, title} = taxonomy.getTaxon(groupId) || defaultGroupDetails;
    const existingGroup = groups.get(id);

    if (existingGroup === undefined) {
        const groupType = taxonomy.getId();
        const group = createGroup(groupType, id, title);

        groups.set(id, group);

        return group;
    }

    return existingGroup;
}

function groupDataAttributesByTaxonomy({dataAttributes, taxonomy}) {
    const groups = new Map();
    const groupByKey = taxonomy.getId();

    dataAttributes.forEach(dataAttribute => {
        const groupId = dataAttribute[groupByKey];
        const group = getOrCreateGroup(groupId, groups, taxonomy);

        group.values.push(dataAttribute);
    });

    return Array.from(groups.values());
}

module.exports = groupDataAttributesByTaxonomy;
