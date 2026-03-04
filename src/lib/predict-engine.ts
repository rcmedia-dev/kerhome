import modelData from './model_data.json';

interface Tree {
    children_left: number[];
    children_right: number[];
    feature: number[];
    threshold: number[];
    value: number[];
}

interface ModelData {
    features: string[];
    categories: Record<string, string[]>;
    medians: Record<string, number>;
    trees: Tree[];
}

const data = modelData as unknown as ModelData;

export function predictPrice(input: Record<string, any>): number {
    const features: number[] = [];

    // Preprocess input into feature vector
    data.features.forEach((featureName) => {
        let value = input[featureName];

        // 1. Handle Categorical Features
        if (data.categories[featureName]) {
            const categories = data.categories[featureName];
            const normalizedValue = value?.toString().trim();

            // Find index (Ordinal Encoding)
            // Note: If not found, use -1 (as handled by OrdinalEncoder unknown_value=-1)
            let index = categories.findIndex(c => c.toLowerCase() === normalizedValue?.toLowerCase());

            // Fallback for special cases or if still not found
            if (index === -1) {
                // Tier-based fallback for neighborhoods
                if (featureName === 'localidade' && input.tier) {
                    if (input.tier === 'premium') value = 'Alvalade';
                    else if (input.tier === 'popular') value = 'Viana';
                    else value = 'Nova Vida - Golfe';
                }

                // Common synonyms
                if (normalizedValue?.toLowerCase() === 'benfica') value = 'Benfica (Inclui Lar Do Patriota)';
                if (normalizedValue?.toLowerCase().includes('nova vida')) value = 'Nova Vida - Golfe';

                // try to find the new value
                index = categories.findIndex(c => c.toLowerCase() === value?.toString().toLowerCase());

                // Default fallbacks if still not found
                if (index === -1) {
                    if (featureName === 'regiao') value = 'Luanda';
                    if (featureName === 'tipo_imovel') value = 'Vivenda';
                    if (featureName === 'finalidade') value = 'Venda';
                    index = categories.findIndex(c => c.toLowerCase() === value?.toString().toLowerCase());
                }
            }

            features.push(index);
        }
        // 2. Handle Numerical Features
        else {
            let numValue = parseFloat(value);
            if (isNaN(numValue)) {
                numValue = data.medians[featureName] ?? 0;
            }
            features.push(numValue);
        }
    });

    // Random Forest Inference
    let totalPrediction = 0;

    for (const tree of data.trees) {
        let nodeIndex = 0;

        while (tree.children_left[nodeIndex] !== -1) {
            const featureIdx = tree.feature[nodeIndex];
            const threshold = tree.threshold[nodeIndex];

            if (features[featureIdx] <= threshold) {
                nodeIndex = tree.children_left[nodeIndex];
            } else {
                nodeIndex = tree.children_right[nodeIndex];
            }
        }

        totalPrediction += tree.value[nodeIndex];
    }

    const meanLogPrice = totalPrediction / data.trees.length;

    // Back-transform from log1p: exp(x) - 1
    const finalPrice = Math.expm1(meanLogPrice);

    return finalPrice;
}
