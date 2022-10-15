import { Link, useMatch, useResolvedPath } from "react-router-dom"
import { Auth } from "aws-amplify"
import './navbar.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMapLocation } from "@fortawesome/free-solid-svg-icons"



export default function Navbar() {

    async function signOut() {
        try {
            await Auth.signOut();
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    return (
    <nav className="nav">
        <div className="upload-icon">
        <Link to="/" className="site-title font-upload-logo">
            <FontAwesomeIcon 
                icon={faMapLocation} 
                size="lg"
                className="font-upload" />
                GeoAtles
        </Link>
        </div>
        <ul>
            <CustomLink to="/about" className="text-nav">About</CustomLink> 
            <CustomLink to="/create_position" className="text-nav">Nova Posició</CustomLink> 
            <button className="sign-out text-nav" onClick={signOut}>Tanca Sessió</button>
        </ul>
    </nav>
    )
}

function CustomLink({to, children, ...props}) {
    const resolvePath = useResolvedPath(to)
    const isActive = useMatch({path: resolvePath.pathname, end: true})
    
    
    return(
        <li className={ isActive ? "active": ""}>
            <Link to={to} {...props}>
                {children}
            </Link>
        </li>
    )
}