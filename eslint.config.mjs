import js from '@eslint/js';
import globals from 'globals';

export default [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                GM_addStyle: 'readonly',
                GM_getValue: 'readonly',
                GM_setValue: 'readonly',
                GM_deleteValue: 'readonly',
                GM_listValues: 'readonly',
                GM_xmlhttpRequest: 'readonly',
                GM_download: 'readonly',
                GM_notification: 'readonly',
                GM_setClipboard: 'readonly',
                GM_log: 'readonly',
                GM_registerMenuCommand: 'readonly',
                GM_unregisterMenuCommand: 'readonly',
                unsafeWindow: 'readonly',
                GM_info: 'readonly',
                exportFunction: 'readonly',
                cloneInto: 'readonly'
            },
            ecmaVersion: 2022,
            sourceType: 'script'
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
            'no-shadow': 'warn',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'multi-line'],
            'no-var': 'off',
            'prefer-const': 'warn',
            'no-param-reassign': 'warn',
            'no-control-regex': 'off'
        }
    },
    {
        files: ['scripts/**/*.js', 'tests/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.node
            },
            sourceType: 'module'
        }
    },
    {
        ignores: ['node_modules/', 'dist/', 'build/', 'coverage/']
    }
];
