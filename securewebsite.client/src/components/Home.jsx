import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';

function Home() {
    document.title = "Welcome";
    const [userInfo, setUserInfo] = useState({});

    useEffect(() => {
        const user = localStorage.getItem("user");
        fetch("api/SecureWebsite/home/" + user, {
            method: "GET",
            credentials: "include"
        }).then(response => response.json()).then(data => {
            setUserInfo(data.userInfo);
            console.log("user info: ", data.userInfo);
        }).catch(error => {
            console.log("Error home page: ", error);
        });
    }, []);

    return (
        <section className='page'>
            <header>
                <h1> Image Gallery </h1>
            </header>
            <div className="content">
                <div className="sidebar">
                    <nav>
                        <ul>
                            <li className="active">Home</li>
                            <li>Image Upload</li>
                        </ul>
                    </nav>
                </div>
                <div className="main-content">
                    <div className="search-bar">
                        <input type="text" placeholder="Search for..." />
                        <button className="filters-button">Filters</button>
                    </div>
                    <div className="image-gallery row">
                        {
                            userInfo ?
                                <>
                                  
                                    {Array(4).fill().map((_, index) => (

                                        <div className="row">
                                        <div className="col-sm-6" key={index}>
                                            <div className="card  col-sm-6">
                                                <img src="butterfly.jpg" className="card-img-top" alt="Butterfly" />
                                                <div className="card-body">
                                                    <h5 className="card-title">Butterfly</h5>
                                                    <p className="card-text">Butterflies have taste receptors on their feet to help them find their host plants and locate food. A female butterfly lands on different plants, drumming the leaves with her feet until the plant releases its juices.</p>
                                                </div>
                                            </div>

                                            </div>

                                        </div>
                                    ))}
                                </> :
                                <div className='warning'>
                                    <div>Access Denied!!!</div>
                                </div>
                        }
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home;
