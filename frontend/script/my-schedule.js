//จักหน้า my-schedule
import { requireSignIn, signOut } from "./auth";

async function initpage(){
   const user = await requireSignIn()
   document.getElementById("user-display-name").textContent = user.name;
   document.getElementById("sign-out-button").addEventListener('click', () => {
    signOut();
   }) 
}

initpage();