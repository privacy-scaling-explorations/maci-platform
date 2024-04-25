// pages/home.js o pages/index.js
import React from 'react';
import { LayoutWithBallot, Layout } from '../../layouts/DefaultLayout';
import { Projects } from "../../features/projects/components/Projects"
const Home = () => {
  return (
    <>
      <Layout>
        <main className='w-full flex flex-col items-center justify-center text-black text-4xl font-ojuju'>
          <img src="/images/animalsL.png" className='absolute left-0 z-0 top-60'/>
          <img src="/images/animalsR.png" className='absolute right-0 z-0 top-24'/>
          <img src='/images/ETHPGF-icon.png' className='z-10 p-4'/>
          <h1 className='text-center mt-8 z-10'>RONDA DE FINANCIAMIENTO PARA COMUNIDADES Y PROYECTOS MEXICANOS</h1>
          <p className='font-bold z-10'>DEL 22 DE MAYO AL 5 DE JUNIO</p>
          <button className='text-3xl bg-PFGOrangeL p-4 m-8 rounded-full text-white z-10 items-center font-montserrat font-medoum'>
            Aplica aqui
          </button>
        </main>
        <footer className='flex items-center m-4 justify-around text-black relative font-ojuju font-bold'>
          <div className='flex flex-col items-center justify-center text-2xl gap-4' style={{width: "364px"}}>
            <h1 className='text-3xl font-bold'>FAQ</h1>
            <li className='flex flex-col items-center gap-1'>
                <h2 className='font-semibold'>Pregunta 1</h2>
                <p className='font-medium'>Respuesta 1</p>
            </li>
            <li className='flex flex-col items-center gap-1'>
                <h2 className='font-semibold'>Pregunta 2</h2>
                <p className='font-medium'>Respuesta 2</p>
            </li>
            <li className='flex flex-col items-center gap-1'>
                <h2 className='font-semibold'>Pregunta 3</h2>
                <p className='font-medium'>Respuesta 3</p>                
            </li>
          </div>
    
          <div className='bg-PGFBrown w-1 absolute bot-0' style={{height: '250px'}}></div>
    
          <div className='text-3xl text-center' style={{width: "364px"}}>
            <h1>ESTA RONDA ES POSIBLE GRACIAS A</h1>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="p-4 bg-PGFBrown rounded-3xl text-white flex items-center justify-center">
                LOGO 1
              </div>
              <div className="p-4 bg-PGFBrown rounded-3xl text-white flex items-center justify-center">
                LOGO 2
              </div>
              <div className="p-4 bg-PGFBrown rounded-3xl text-white flex items-center justify-center">
                LOGO 3
              </div>
              <div className="p-4 bg-PGFBrown rounded-3xl text-white flex items-center justify-center">
                LOGO 4
              </div>
            </div>
          </div>
        </footer>
      </Layout>
    </>
  );
};

export default Home;