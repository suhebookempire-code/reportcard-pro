import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'72px',height:'72px',background:'linear-gradient(135deg,#eab308,#ca8a04)',borderRadius:'16px',marginBottom:'16px'}}>
            <span style={{fontSize:'28px',fontWeight:'bold',color:'#0a0f1e'}}>RC</span>
          </div>
          <h1 style={{fontSize:'28px',fontWeight:'bold',color:'#fff',margin:'0 0 4px'}}>ReportCard Pro</h1>
          <p style={{color:'#94a3b8',fontSize:'14px',margin:0}}>School Report Management System</p>
          <p style={{color:'#eab308',fontSize:'12px',margin:'4px 0 0',fontStyle:'italic'}}>Powered by Suh Ebook Empire</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(234,179,8,0.2)',borderRadius:'20px',padding:'32px'}}>
          <h2 style={{fontSize:'18px',fontWeight:'bold',color:'#fff',margin:'0 0 24px'}}>Sign In</h2>
          {error && <div style={{background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'8px',padding:'12px',marginBottom:'16px',color:'#fca5a5',fontSize:'14px'}}>{error}</div>}
          <form onSubmit={handleLogin}>
            <div style={{marginBottom:'16px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#94a3b8',marginBottom:'6px'}}>Email Address</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} type='email' placeholder='your@email.com' required style={{width:'100%',padding:'12px 14px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box'}} />
            </div>
            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block',fontSize:'13px',color:'#94a3b8',marginBottom:'6px'}}>Password</label>
              <input value={password} onChange={e=>setPassword(e.target.value)} type='password' placeholder='........' required style={{width:'100%',padding:'12px 14px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'10px',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box'}} />
            </div>
            <button type='submit' disabled={loading} style={{width:'100%',padding:'14px',background:loading?'#92400e':'linear-gradient(135deg,#eab308,#ca8a04)',border:'none',borderRadius:'10px',color:'#0a0f1e',fontWeight:'bold',fontSize:'15px',cursor:loading?'not-allowed':'pointer'}}>
              {loading?'Signing in...':'Sign In'}
            </button>
          </form>
          <p style={{textAlign:'center',fontSize:'12px',color:'#475569',marginTop:'20px'}}>Contact your administrator for access credentials</p>
        </div>
      </div>
    </div>
  );
}