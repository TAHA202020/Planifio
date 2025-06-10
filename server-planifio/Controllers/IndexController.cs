using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
[Route("")]
public class IndexController:ControllerBase{


[HttpGet("")]
public string Index()
{
    return "hello from server";  
}

}