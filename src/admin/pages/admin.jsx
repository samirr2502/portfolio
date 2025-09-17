
function Admin({setAuthenticated}){
    function handleLogout() {
        setAuthenticated(false)
    }
    return (
        <>
     <h1>Welcome Samir</h1>
     <button onClick={handleLogout}>logout</button>
        </>
    )
}

export default Admin