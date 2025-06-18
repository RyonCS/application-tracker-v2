import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from './../lib/prisma';


export function initializePassport() {
    passport.use(
        new LocalStrategy(
            { usernameField: 'email' },
            async (email, password, done) => {
                try {
                    const user = await prisma.user.findUnique({
                        where: { email }
                    });
                    if (!user) {
                        return done(null, false, { message: 'No User Found.' });
                    }
                    const valid = await bcrypt.compare(password, user.passwordHash);
                    if (!valid) {
                        return done(null, false, { message: 'Wrong Password.' });
                    }
                    return done(null, user);
                } catch (error) {
                    return done(error);
                }
            }
        )
    );

   
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({
                where: { id: id as string },
            });
            done(null, user);
        } catch (err) {
            done(err, null);
        }

    })
}