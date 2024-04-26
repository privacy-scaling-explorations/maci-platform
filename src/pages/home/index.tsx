// pages/home.js o pages/index.js
import React from 'react';
import { LayoutWithBallot, Layout } from '../../layouts/DefaultLayout';
import { Projects } from "../../features/projects/components/Projects"
const Home = () => {
  return (
    <>
      <Layout>
        <div className='w-full flex flex-col py-12 items-center justify-center text-black text-4xl font-ojuju'>
          <img src="/images/animalsL.png" className='absolute left-0 z-0 top-60 lg:opacity-100 opacity-70'/>
          <img src="/images/animalsR.png" className='absolute right-0 z-0 top-24 lg:opacity-100 opacity-70'/>
          <img src='/images/ETHPGF-icon.png' className='z-10 p-4'/>
          <h1 className='text-center mt-8 z-10'>RONDA DE FINANCIAMIENTO PARA COMUNIDADES Y PROYECTOS MEXICANOS</h1>
          <p className='font-bold z-10 text-center'>DEL 22 DE MAYO AL 5 DE JUNIO</p>
          <button className='text-3xl bg-PGFOrangeL p-4 m-8 rounded-full text-white z-10 items-center font-montserrat font-medium'>
            Aplica aqui
          </button>
        </div>
        
        <div className='flex flex-col items-center py-12 justify-around text-black relative md:flex-row'>
          <div className='items-center justify-center text-2xl gap-4' style={{width: "350px"}}>
            <h1 className='text-3xl font-bold text-center'>FAQ</h1>
            <div className='text-medium text-center text-base py-8 space-y-4'>
              <div>
                <h2 className='font-semibold'>¿Hacia quién va dirigida esta ronda?</h2>
                <p>A proyectos y comunidades mexicanas enfocadas en la reudcción de brecha de genero, Incorporación de nuevos usuarios, comunides locales y ReFi.</p>
              </div>
              <div>
                <h2 className='font-semibold'>¿Qué requisitos debo tener?</h2>
                <p>Ser una comunidad o proyecto mexicano y tener pruebas on-chain, como: POAPs, Unlock Protocol, NFTs o EAS.</p>
              </div>
              <div>
              <h2 className='font-semibold'>¿Qué tecnologías se utilizaran?</h2>
              <p>MACI (Minimal Anti-Collusion Infrastructure)
              EasyRetroPGF
              Hypercerts
              EAS</p>                
              </div>
              <div>
              <h2 className='font-semibold items-center'>¿Tienes alguna otra duda?</h2>
                <p>Te invitamos a nuestro grupo de Telegram</p>
                <a href='https://t.me/+WjS3Nf8Y75UwYWIx' className='underline'>Ethereum México PGF</a>
              </div>
            </div>
          </div>
    
          <div className='hidden bg-PGFBrown w-1 absolute bot-0 md:block' style={{height: '450px'}}></div>
    
          <div className='text-3xl text-center py-12' style={{width: "364px"}}>
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
        </div>

        <div className='py-12 text-xl md:text-3xl relative'>
          <img className='pl-4 md:pl-80' src='/images/map.png'></img>
          <div className='absolute top-0 right-0 space-y-4 w-96 text-center md:top-48 md:bottom-36 md:left-16 md:space-y-8'>
            <h1>Más de 26 comunidades alrededor de todo México</h1>
            <h2 className='font-semibold'>$10,000 USD DE MATHCING POOL</h2>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Home;