
import fs from 'fs';
import path from 'path';

const filesToAnalyze = [
    'apps/frontend/src/composables/renderer/useRendererOrchestrator.ts',
    'apps/frontend/src/lib/components/DynamicRenderer.vue',
    'apps/frontend/src/lib/components/core/DynamicRenderer.utils.ts',
    'apps/frontend/src/services/auth/AuthService.ts',
    'apps/frontend/src/stores/auth/index.ts',
    'apps/frontend/src/utils/module/orchestration.ts',
    'apps/frontend/src/router/routing.ts'
];

function analyzeComplexity(filePath) {
    const fullPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) return { file: filePath, error: 'Not found' };
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Simple Cyclomatic Complexity estimation
    const decisionPoints = (content.match(/\b(if|for|while|case|catch)\b/g) || []).length;
    const logicalOperators = (content.match(/(&&|\|\|)/g) || []).length;
    const ternaryOperators = (content.match(/\?/g) || []).filter((_, i) => {
        // Very basic check to avoid matching types or optional chaining if possible
        // This is a rough estimation.
        return true; 
    }).length;
    
    // Refined ternary count (avoiding optional chaining and types)
    const refinedTernary = (content.match(/[^\.\?]\?[^:]+:/g) || []).length;

    const cyclomatic = decisionPoints + logicalOperators + refinedTernary + 1;

    // Simple Cognitive Complexity estimation (nesting based)
    let cognitive = 0;
    let nesting = 0;
    const lines = content.split('\n');
    lines.forEach(line => {
        const openBraces = (line.match(/\{/g) || []).length;
        const closeBraces = (line.match(/\}/g) || []).length;
        
        if (line.match(/\b(if|for|while|case|catch)\b/)) {
            cognitive += (1 + nesting);
        }
        
        nesting += openBraces;
        nesting -= closeBraces;
        if (nesting < 0) nesting = 0;
    });

    return {
        file: filePath,
        cyclomatic,
        cognitive,
        loc: lines.length
    };
}

const results = filesToAnalyze.map(analyzeComplexity);
console.log(JSON.stringify(results, null, 2));
