import React from 'react';

import Main from './components/Main'

const App = () => {
  const inputNumberHandler = <D extends Function>(dispatch: D) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    if (name.includes('[')) {
      const [firstName, secondName] = name.split('[')
      const index = secondName[0]
      const second = secondName.split('.')[1];
      dispatch((prev: any) => prev.map((item: any, i: number) => i === +index ? { ...item, [second]: value } : item))
      return
    }

    if (name.includes('.')) {
      const secondName = name.split('.')[1];
      dispatch((prev: any) => ({
        ...prev,
        [secondName]: value
      }))
      return
    }

    dispatch(value)
  };

  return (
    <>
      <Main />
    </>
  )
}

export default App;
