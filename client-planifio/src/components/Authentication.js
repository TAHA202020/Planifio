import { useState } from "react";

export default function Authentication() {
    const [email, setEmail] = useState("");
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
                    <label className={"text-sm"+`${canEnterotp?"":"opacity-25 cursor-not-allowed"}`}>OTP </label>
                    
            </div>
            <div className="card-footer justify-start">
                <input type="text" placeholder="123456" className="input input-sm rounded-md"  disabled={!canEnterotp}/>
            </div>
            <div className="card-footer justify-start">
                <button className="btn btn-primary btn-sm w-full mt-5" disabled={!canEnterotp}>Login</button>
            </div>
            
        </div> 
    </div>
    )

}
  