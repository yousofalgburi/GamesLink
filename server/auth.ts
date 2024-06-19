import { Hono } from 'hono'

const authRoutes = new Hono()

authRoutes.post('/signup', async (c) => {
    const { username, password } = await c.req.json()
    // Add logic to handle user registration
    // For example, save the user in a database
    return c.json({ message: 'Signup successful', username })
})

authRoutes.post('/signin', async (c) => {
    const { username, password } = await c.req.json()
    // Add logic to handle user login
    // For example, check user credentials in a database
    if (username === 'example' && password === 'password') {
        // Replace with actual authentication logic
        return c.json({ message: 'Signin successful', username })
    } else {
        return c.json({ message: 'Invalid credentials' }, 401)
    }
})

export { authRoutes }
