const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const Module = require('node:module');
const { buildSync } = require('esbuild');
const React = require('react');
const { renderToString } = require('react-dom/server');

// Compile the real route definitions while replacing only page content,
// Firebase session state, and browser navigation with SSR-friendly fixtures.
const appPath = path.resolve(__dirname, '../src/App.jsx');
const appSource = require('node:fs').readFileSync(appPath, 'utf8')
    .replace("from 'react-router-dom'", "from '../tests/routerFixture.jsx'")
    .replace("from './context/AuthContext'", "from '../tests/authFixture.jsx'")
    .replace(/from '\.\/pages\/[^']+'/g, "from '../tests/pageFixture.jsx'")
    .replace("from './components/DashboardLayout'", "from '../tests/pageFixture.jsx'");
const result = buildSync({
    stdin: { contents: appSource, resolveDir: path.dirname(appPath), loader: 'jsx' },
    bundle: true,
    platform: 'node',
    format: 'cjs',
    packages: 'external',
    write: false
});
const compiledApp = new Module(appPath, module);
compiledApp.filename = appPath;
compiledApp.paths = Module._nodeModulePaths(path.dirname(appPath));
compiledApp._compile(result.outputFiles[0].text, appPath);
const App = compiledApp.exports.default;

const renderRoute = (route, user, role, extra = {}) => {
    globalThis.__accessRoute = route;
    globalThis.window = { location: { pathname: route } };
    globalThis.__accessAuth = { user, role, loading: false, syncing: false, ...extra };
    return renderToString(React.createElement(App));
};

test('anonymous visitors can open the existing form without signing in', () => {
    assert.match(renderRoute('/', null, null), /data-page="allowed"/);
});

test('admin dashboard access is not restricted by the signed-in email', () => {
    assert.match(renderRoute('/dashboard', { email: 'admin@example.com' }, 'admin'), /data-page="allowed"/);
});

test('the existing staff route does not check the signed-in email', () => {
    assert.match(renderRoute('/', { email: 'user@gmail.com' }, 'staff'), /data-page="allowed"/);
});

test('pending users still require approval for the dashboard', () => {
    assert.match(renderRoute('/dashboard', { email: 'staff@huntsmanoptics.com' }, 'pending'), /data-redirect="\/pending-approval"/);
});
