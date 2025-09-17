import { useEffect, useState } from 'react';

function Login({authenticated, setAuthenticated}){
    const [password, setPassword] = useState("")
    function handleLogin(){
        if (password == '1234'){
            setAuthenticated(true);
        }
    }
    return (

        <>
     <h1>Login</h1>
     <form onSubmit={handleLogin}>
     <input type="password" placeholder="password" onChange={(e) =>setPassword(e.target.value)}/>
     <button type={'submit'}>Login</button>
     </form>
        </>
    )
}

export default Login