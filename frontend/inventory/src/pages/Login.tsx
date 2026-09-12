import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../apis/auth";
import { AuthContext } from "../context/AuthContext";

function LoginPage(){
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = useContext(AuthContext);

  const navigate = useNavigate();
  



  async function handleLogin(){
    setError("");
    setLoading(true);
    try{
      const data = await login(username, password);
      auth?.login(data.access, data.refresh);
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


    </div>
  )

}
export default LoginPage;