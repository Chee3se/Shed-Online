import { Link } from '@inertiajs/react';
export default function Layout({ auth }) {
    return (
        <div className="bg-white text-black">
            <nav className="flex justify-center items-center h-16 bg-white text-black shadow-sm gap-6">
                <div>
                    <Link href={route('home')}>Home</Link>
                </div>


            <div className="hidden md:flex flex-row gap-6 items-center">
                {auth?.user ? (
                    <>
                        <Link href={route('profile.edit')}>Profile</Link>
                        <Link href={route('logout')} method="post">Logout</Link>
                    </>
                ) : (
                    <>
                        <Link href={route('login')}>Login</Link>
                        <Link href={route('register')}>Register</Link>
                    </>
                )}
            </div>
            </nav>


        </div>
    );
}
