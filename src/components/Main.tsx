import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  AppBar,
  Button,
  Container,
  CssBaseline,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  TextFieldProps,
  Toolbar,
  Typography,
} from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import MenuIcon from '@mui/icons-material/Menu';
import NumberFormat, { NumberFormatProps, NumberFormatValues } from 'react-number-format';

import HideOnScroll from './HideOnScroll'
import { useLocalStorage } from './hooks/useLocalStorage';

type Resource = {
  price?: number | undefined,
  amount?: number | undefined,
}

interface Data {
  id: string,
  resources: Resource[],
  artifact: Resource,
  factoryPrice?: number | undefined,
  realizationPrice?: number | undefined,
  returnPercent?: number | undefined,
  returnPercentList: number[],
  initialAmountItems?: number | undefined,
  finiteAmountItems?: number | undefined,
}

const initData: Data = {
  id: '1',
  resources: [
    { price: 0, amount: 0 },
    { price: 0, amount: 0 },
  ],
  artifact: { price: 0, amount: 0 },
  factoryPrice: 0,
  realizationPrice: 0,
  returnPercent: 24.7,
  returnPercentList: [24.7, 36.7, 42.8],
  initialAmountItems: 0,
  finiteAmountItems: 0,
}

const numberFormatProps: NumberFormatProps<TextFieldProps> = {
  customInput: TextField,
  margin: "normal",
  size: "small",
  thousandSeparator: " ",
  decimalScale: 0,
  allowNegative: false,
  allowLeadingZeros: false,
  fullWidth: true,
}

const Main = () => {
  const [localData, setLocalData] = useLocalStorage("calculateCraftingData", initData)

  const [resources, setResources] = useState(localData.resources)
  const [artifact, setArtifact] = useState(localData.artifact)
  const [factoryPrice, setFactoryPrice] = useState(localData.factoryPrice)
  const [realizationPrice, setRealizationPrice] = useState(localData.realizationPrice)
  const [returnPercent, setReturnPercent] = useState(localData.returnPercent)
  const [returnPercentList, setReturnPercentList] = useState(localData.returnPercentList)
  const [initialAmountItems, setInitialAmountItems] = useState(localData.initialAmountItems)
  const [finiteAmountItems, setFiniteAmountItems] = useState(localData.finiteAmountItems)

  useEffect(() => setLocalData({ ...localData, resources }), [resources])
  useEffect(() => setLocalData({ ...localData, artifact }), [artifact])
  useEffect(() => setLocalData({ ...localData, factoryPrice }), [factoryPrice])
  useEffect(() => setLocalData({ ...localData, realizationPrice }), [realizationPrice])
  useEffect(() => setLocalData({ ...localData, returnPercent }), [returnPercent])
  useEffect(() => setLocalData({ ...localData, initialAmountItems }), [initialAmountItems])
  useEffect(() => setLocalData({ ...localData, finiteAmountItems }), [finiteAmountItems])
  
  const onChangeResourcesHandler = (updatedResource: Resource, index: number) => {
    setResources(
      prev => prev.map((res, i) => i === index
        ? { ...res, ...updatedResource }
        : res
      )
    )
  };
  
  const onChangeArtifactHandler = (updatedResource: Resource) => {
    setArtifact(prev => ({ ...prev, ...updatedResource }))
  };
  
  const onChangeHandler = <D extends Function>(dispatch: D) => {
    return (values: NumberFormatValues) => dispatch(values.floatValue)
  };
    
  return (
    <React.Fragment>
      <CssBaseline />

      <HideOnScroll>
        <AppBar sx={{ top: { xs: 'auto', md: 0 }, bottom: { xs: 0, md: 'auto', } }}>
          <Toolbar>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Calculate crafting
            </Typography>

            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Toolbar />

      <Container sx={{
        paddingTop: { xs: 0, md: 4 },
        paddingX: { xs: 2, md: 4 },
        marginTop: { xs: "-60px", md: 0 }
      }}>
        <Grid container spacing={2}>
          <Grid item xs={4} md={true}>
            <Item>
              {resources.map((resource, i) => (
                <NumberFormat
                  { ...numberFormatProps }
                  color="info"
                  prefix="$ "
                  label={`Ціна ресурсу ${i + 1}`}
                  key={`resources[${i}].price`}
                  value={resource.price}
                  onValueChange={({ floatValue }) => onChangeResourcesHandler({ price: floatValue }, i)}
                />
              ))}

              <NumberFormat
                { ...numberFormatProps }
                color="primary"
                prefix="$ "
                label="Ціна артефакту"
                value={artifact.price}
                onValueChange={({ floatValue }) => onChangeArtifactHandler({ price: floatValue })}
              />
            </Item>
          </Grid>

          <Grid item xs={4} md={true}>
            <Item>
              {resources.map((resource, i) => (
                <NumberFormat
                  { ...numberFormatProps }
                  color="info"
                  label={`Кількість ресурсу ${i + 1}`}
                  key={`resources[${i}].amount`}
                  value={resource.amount}
                  onValueChange={({ floatValue }) => onChangeResourcesHandler({ amount: floatValue }, i)}
                />
              ))}

              <NumberFormat
                { ...numberFormatProps }
                color="warning"
                label="Кількість артефакту"
                value={artifact.amount}
                onValueChange={({ floatValue }) => onChangeArtifactHandler({ amount: floatValue })}
              />
            </Item>
          </Grid>

          <Grid item xs={4} md={true}>
            <Item>
              <NumberFormat
                { ...numberFormatProps }
                color="error"
                prefix="$ "
                label="Ціна виробництва"
                value={factoryPrice}
                onValueChange={onChangeHandler(setFactoryPrice)}
              />

              <NumberFormat
                { ...numberFormatProps }
                color="secondary"
                prefix="$ "
                label="Ціна реалізації"
                value={realizationPrice}
                onValueChange={onChangeHandler(setRealizationPrice)}
              />

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="demo-simple-select-label">Відсоток повернення ресурсів</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Відсоток повернення ресурсів"
                  color="success"
                  sx={{ textAlign: "left" }}
                  fullWidth
                  value={returnPercent}
                  onChange={(event) => setReturnPercent(+event.target.value)}
                >
                  <MenuItem divider>
                    <NumberFormat
                      { ...numberFormatProps }
                      variant="standard"
                      margin="none"
                      label="Додати варіант"
                      isAllowed={({ floatValue }) => (floatValue || 0) <= 100}
                      decimalScale={1}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                          <Typography variant="subtitle2" sx={{ paddingX: "6px" }}>%</Typography>
                          <IconButton aria-label="delete" size="small" color="success" onClick={() => console.log('added')}>
                            <AddCircleRoundedIcon />
                          </IconButton>
                        </InputAdornment>,
                      }}
                    />
                  </MenuItem>

                  {returnPercentList.map((percent, i) => ( 
                    <MenuItem key={percent+i} value={percent}>
                      <span style={{ opacity: '0' }}>-</span>{percent}%
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* <Autocomplete
                options={returnPercentList}
                renderInput={(params) => (
                  <NumberFormat
                    {...params}
                    { ...numberFormatProps }
                    label="Відсоток повернення ресурсів"
                    // select
                    // fullWidth
                    value={returnPercent}
                    decimalScale={2}
                    onValueChange={onChangeHandler(setReturnPercent)}
                  />
                )}
              /> */}
            </Item>
          </Grid>

          <Grid item xs={6} md={true}>
            <Item>
              <NumberFormat
                { ...numberFormatProps }
                label="Кількість елементів"
                value={initialAmountItems}
                onValueChange={onChangeHandler(setInitialAmountItems)}
              />
            </Item>
          </Grid>

          <Grid item xs={6} md={true}>
            <Item>
              <NumberFormat
                { ...numberFormatProps }
                label="Ціна Виробництва"
                value={factoryPrice}
                onValueChange={onChangeHandler(setFactoryPrice)}
              />
            </Item>
          </Grid>
        </Grid>
      </Container>
    </React.Fragment >
  )
}

export default Main;

const Item = styled(Paper)`
  padding: 7px 10px;
`
