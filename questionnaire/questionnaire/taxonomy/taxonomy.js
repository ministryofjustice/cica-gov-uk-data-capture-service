'use strict';

function createTaxonomy({id, definition}) {
    function getId() {
        return id;
    }

    function getTaxon(taxonId) {
        const taxon = definition.taxa[taxonId];

        if (taxon === undefined) {
            return undefined;
        }

        return {
            id: taxonId,
            title: taxon.title
        };
    }

    function getTaxa() {
        const taxaDefinition = definition.taxa;
        const taxa = Object.keys(taxaDefinition).map(taxonId => getTaxon(taxonId));

        return taxa;
    }

    return Object.freeze({
        getId,
        getTaxa,
        getTaxon
    });
}

module.exports = createTaxonomy;
