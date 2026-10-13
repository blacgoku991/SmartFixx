export const metadata={title:'Déconnexion — SmartFixx',robots:{index:false,follow:false}};
export default function Logout(){return <main className="section" style={{paddingTop:140}}><h1>Fermer votre session</h1><form action="/api/admin/logout" method="post"><button className="button button-primary">Se déconnecter</button></form></main>}
