import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../Utils/Auth";
import BoardsStore from "../Context/BoardsStore";
import planifioLogo from "../assets/Planifio.svg";
export default function Authentication() {
    const Authenticated=document.cookie;
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
                    credentials: "include",
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
            credentials: "include",
        }).then(res=>res.json()).then(data=>{
            BoardsStore.getState().Authenticated(true);
            navigate("/dashboard")
        })
        .catch(error => {
            console.log("Error:", error);
        })
    }
    
    return (<div className="w-full h-[100vh] flex flex-col items-center justify-center">
        <div className="card p-10">

           
          
            <div className="card-header justify-center"><svg fill="none" height="42" viewBox="0 0 32 32" width="42" xmlns="http://www.w3.org/2000/svg">
            <rect height="100%" rx="16" width="100%"></rect>
            <path clip-rule="evenodd" d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z" fill="currentColor" fill-rule="evenodd"></path>
          </svg>Sign in</div>
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
  