import logo from './logo.svg';
import './App.css';
import {useState, useEffect} from "react";

function App() {
  const [streamUrl, setStreamUrl] = useState("");
  const [user, setUser] = useState("golfcraft");
  const [pass, setPass] = useState("");

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    (async()=>{
      const res = await fetch("https://service.golfcraftgame.com/golfcraft-manager/api/get-stream-url").then(r=>r.text());
      setStreamUrl(res);
    })();
  }, [])

  function send(){
    setLoading(true)
    fetch('https://service.golfcraftgame.com/golfcraft-manager/api/set-stream-url', {
      method:"POST",
      body:JSON.stringify({
        "streamURL":streamUrl
      }),
      headers:{
        "Authorization":`Basic ${ btoa("golfcraft:" + pass)}`,
        "Content-Type":"application/json"
      }
    }).then().finally(()=>{
      setLoading(false)
    })
  }

  return (
    <div className="App">
       <table><tbody>
         <tr><td></td><td width="300"></td></tr>
         <tr><td>Password</td><td><input type="password" value={pass} onChange={(e)=>setPass(e.target.value)} /></td></tr>
         <tr><td></td></tr>
         <tr><td>StremURL</td><td><input value={streamUrl} onChange={(e)=>setStreamUrl(e.target.value)} /></td></tr>
         <tr><td><button disabled={loading} onClick={()=>send()}>SEND</button></td></tr>
         </tbody>
       </table>
    </div>
  );
}

export default App;
