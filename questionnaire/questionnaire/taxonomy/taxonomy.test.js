'use strict';

const createTaxonomy = require('./taxonomy');

const taxonomyDefinition = {
    taxa: {
        'about-application': {
            title: 'About your application'
        },
        'applicant-details': {
            title: 'Your details'
        },
        crime: {
            title: 'About the crime'
        }
    }
};

describe('Taxonomy', () => {
    it('should return the taxonomy id', () => {
        const themeTaxonomy = createTaxonomy({
            id: 'theme',
            definition: taxonomyDefinition
        });

        expect(themeTaxonomy.getId()).toEqual('theme');
    });

    it('should return a specified taxon', () => {
        const themeTaxonomy = createTaxonomy({
            id: 'theme',
            definition: taxonomyDefinition
        });

        expect(themeTaxonomy.getTaxon('applicant-details')).toEqual({
            id: 'applicant-details',
            title: 'Your details'
        });
    });

    it('should return undefined if the specified taxon does not exist', () => {
        const themeTaxonomy = createTaxonomy({
            id: 'theme',
            definition: taxonomyDefinition
        });

        expect(themeTaxonomy.getTaxon('this-taxon-id-does-not-exist')).toEqual(undefined);
    });

    it('should return all taxa', () => {
        const themeTaxonomy = createTaxonomy({
            id: 'theme',
            definition: taxonomyDefinition
        });

        expect(themeTaxonomy.getTaxa()).toEqual([
            {
                id: 'about-application',
                title: 'About your application'
            },
            {
                id: 'applicant-details',
                title: 'Your details'
            },
            {
                id: 'crime',
                title: 'About the crime'
            }
        ]);
    });
});
