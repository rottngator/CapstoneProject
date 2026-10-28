import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
    }));
});

afterEach(() => {
    jest.clearAllMocks();
});

test('renders the Sound Hub discovery page', async () => {
    render(
        <MemoryRouter>
            <App />
        </MemoryRouter>
    );

    expect(await screen.findByText('It’s quiet in here. For now.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /favorite sound/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /join to share your music/i })).toHaveAttribute('href', '/register');
});

test('lets visitors browse the public event calendar', async () => {
    render(
        <MemoryRouter initialEntries={['/calendar']}>
            <App />
        </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /community calendar/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign in to host an event/i })).toHaveAttribute('href', '/login');
});

test('lets visitors search public artist results', async () => {
    render(
        <MemoryRouter initialEntries={['/search?query=artist']}>
            <App />
        </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: /artists for “artist”/i })).toBeInTheDocument();
    expect(await screen.findByText(/no artists found yet/i)).toBeInTheDocument();
});
