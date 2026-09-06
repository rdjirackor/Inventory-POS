import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { login } from '../apis/auth';

function LoginPage(){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  



  async function handleLogin(){
    setError("");
    setLoading(true);
    try{
      const data = await login(username, password);
      console.log("Login Successful: ",data);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token",data.refresh);
      navigate("/dashboard");      
    }
      catch(error){
        setError(error instanceof Error ? error.message : "Login Failed");
      }
    finally{
      setLoading(false);
    }}


  return (
    <div>
      <h1>Login</h1>
      <input
      type = 'text'
      placeholder = 'Username'
      value = {username}
      onChange = {(e) => setUsername(e.target.value)}
      />


      <input
      type = 'password'
      placeholder = 'Password'
      value = {password}
      onChange = {(e) => setPassword(e.target.value)}
      />

      <button
      onClick={handleLogin} disabled={loading}>
        Login
      </button>

      {/* {error && <p>{error}</p>} */}
      {error ? <p>{error}</p>  :<p>Login Accepted</p> }


    </div>
  )

}
export default LoginPage;