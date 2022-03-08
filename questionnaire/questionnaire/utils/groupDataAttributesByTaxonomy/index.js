'use strict';

function createGroup(groupId, taxonomy) {
    const groupDetails = taxonomy.getTaxon(groupId);
    const group = {
        type: taxonomy.getId(),
        id: groupId,
        title: groupDetails.title,
        values: []
    };

    return group;
}

function getOrCreateGroup(groupId, groups, taxonomy) {
    const existingGroup = groups.get(groupId);

    if (existingGroup === undefined) {
        const group = createGroup(groupId, taxonomy);

        groups.set(groupId, group);

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
