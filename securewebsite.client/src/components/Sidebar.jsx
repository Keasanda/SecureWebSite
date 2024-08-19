import React from 'react';
import './Sidebar.css';

const Sidebar= ()=> {
    return (

        <div className={taste.sidebarrHome}>
<img src="src/assets/Image Gallery.png"className={taste.logo} />
<nav className={taste.navButoom}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li>
                <button className={taste.homelog} onClick={() => window.location.href = '/home'}>
                        <IoHomeOutline className="icon ma" /> Home
                    </button>
                </li>
                <li>
                    <button className={taste.homelog} onClick={() => window.location.href = '/dragndrop'}>
                        <IoCameraOutline className="icon ma" /> Image Upload
                    </button>
                </li>
                <li>
                    <button className={taste.homelog} onClick={() => window.location.href = '/MyGallery'}>
                        <GrGallery className="icon ma" /> My Gallery
                    </button>
                </li>
            </ul>
        </nav>
        <button className={taste.logout} onClick={handleLogout}>
    <MdLogout className={taste.icon} /> Logout
</button>
    </div>
)
}