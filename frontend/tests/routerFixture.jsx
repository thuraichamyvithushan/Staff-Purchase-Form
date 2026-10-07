import React from 'react';
import { MemoryRouter } from 'react-router-dom';
export { Routes, Route } from 'react-router-dom';

export const BrowserRouter = ({ children }) => (
    <MemoryRouter initialEntries={[globalThis.__accessRoute]}>{children}</MemoryRouter>
);
export const Navigate = ({ to }) => <span data-redirect={to} />;
