import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../Utils/Auth";

export default function Authentication() {
    const Authenticated=isAuthenticated();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState();
    const [canEnterotp, setCanEnterOtp] = useState(false);
    const canSendOTP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)?true:false;
    const handleRequestOtp = () => 
        {
            if (!canSendOTP) {
                return;
            }
            fetch("http://localhost:8000/auth/request-otp", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                }).then(res=>res.json()).then(data=>{
                    console.log(data);
                    if(data.status==="success"){
                        setCanEnterOtp(true);
                    }
                })
            .catch(error => {
                console.log("Error:", error);
            })
            
        }
    const handleValidateOtp = () =>{
        if(!canEnterotp)
            return 
        fetch("http://localhost:8000/auth/validate-otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email,otp:Number(otp) }),
        }).then(res=>res.json()).then(data=>{
            localStorage.setItem("token",data.token);
            navigate("/dashboard")
        })
        .catch(error => {
            console.log("Error:", error);
        })
    }
    useEffect(()=>{
        if(Authenticated){
            navigate("/dashboard")
        }
    }   ,[])
    return (<div className="w-full h-[100vh] flex flex-col items-center justify-center">
        <div className="card p-10">
            <div className="card-header justify-center">Login/Register</div>
            <div className="card-footer justify-start relative">
                    <p className={`text-sm absolute top-0 right-0 ${canSendOTP?"cursor-pointer link link-primary":"opacity-25 cursor-not-allowed"}`} onClick={handleRequestOtp}>Send OTP</p>
                    <label className="text-sm">Email</label>
            </div>
            <div className="card-footer justify-start">
                <input type="text" placeholder="John.Doe@email.com" className="input input-sm rounded-md" value={email} onChange={(e)=>{setEmail(e.target.value)}}/>
            </div>
            <div className="card-footer justify-start">
                    <label className={`${canEnterotp?"":"opacity-25 cursor-not-allowed"} text-sm`}>OTP </label>
                    
            </div>
            <div className="card-footer justify-start">
                <input type="text" placeholder="123456" className="input input-sm rounded-md" value={otp}  disabled={!canEnterotp} onChange={(e)=>{
                    if(!Number.isInteger(Number(e.target.value))){
                        return
                    }
                    setOtp(e.target.value)}
                }/>
            </div>
            <div className="card-footer justify-start">
                <button className="btn btn-primary btn-sm w-full mt-5" disabled={!canEnterotp} onClick={handleValidateOtp}>Login</button>
            </div>
            
        </div> 
    </div>
    )

}
  