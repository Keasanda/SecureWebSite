import { useEffect, useState } from 'react';

function Admin() {

    // Set the document title to "Admin"
    document.title = "Admin";

    // State to hold the list of trusted partners
    const [partners, setPartners] = useState([]);

    // useEffect hook to fetch trusted partners when the component mounts
    useEffect(() => {

        // Fetch data from the admin API endpoint
        fetch("api/SecureWebsite/admin", {
            method: "GET",
            credentials: "include" // Include credentials such as cookies in the request
        })
            .then(response => response.json()) // Parse the response JSON data
            .then(data => {
                // Set the trusted partners in state after data is fetched
                setPartners(data.trustedPartners);
                console.log("trustedPartners: ", data.trustedPartners); // Log the data for debugging
            })
            .catch(error => {
                // Handle any errors during the fetch process
                console.log("Error home page: ", error);
            });
    }, []); // Empty dependency array ensures this runs once when the component mounts

    return (
        <section className='admin-page page'>
            <header>
                <h1>Admin page</h1>
            </header>
            <section>
                {
                    // If partners exist, display them; otherwise, show "Waiting..."
                    partners ?
                        <div>
                            <div>Our trusted partners are:</div>
                            <ol>
                                {/* Map through partners and display each one in a list */}
                                {partners.map((partner, i) => <li key={i}>{partner}</li>)}
                            </ol>
                        </div>
                        :
                        <div className='waiting-page'>
                            <div>Waiting...</div>
                        </div>
                }
            </section>
        </section>
    );
}

export default Admin;
