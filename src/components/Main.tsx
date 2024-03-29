/* eslint-disable react-hooks/exhaustive-deps */
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
import { 
  AddCircleRounded as AddCircleRoundedIcon,
  Menu as MenuIcon,
  Cached as CachedIcon,
  Storage as StorageIcon,
  RemoveCircleRounded as RemoveCircleRoundedIcon,
} from '@mui/icons-material';
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
  returnPercent: 24.8,
  returnPercentList: [24.8],
  initialAmountItems: 0,
}

const numberFormatProps: NumberFormatProps<TextFieldProps> = {
  customInput: TextField,
  margin: "normal",
  size: "small",
  thousandSeparator: " ",
  decimalScale: 0,
  allowNegative: false,
  allowLeadingZeros: false,
  allowEmptyFormatting: true,
  fullWidth: true,
}

const labelStyles = {
  borderRadius: "3px",
  padding: "1px 4px",
  marginLeft: "-3px",
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

  const [finiteAmountItems, setFiniteAmountItems] = useState(0)
  const [profit, setProfit] = useState(0)
  const [resourcesProfit, setResourcesProfit] = useState(0)
  const [resourcesExpenses, setResourcesExpenses] = useState(0)
  const [generalExpenses, setGeneralExpenses] = useState(0)

  const [additionalPercent, setAdditionalPercent] = useState<number | undefined>()

  useEffect(() => {
    setLocalData({ id: initData.id, resources, artifact, factoryPrice, realizationPrice, returnPercent, returnPercentList, initialAmountItems })
  }, [ resources, artifact, factoryPrice, realizationPrice, returnPercent, returnPercentList, initialAmountItems ])

  useEffect(() => {
    setResourcesExpenses(calculateResourcesExpensesForOne())
  }, [resources])

  useEffect(() => {
    setGeneralExpenses(calculateGeneralExpenses())
  }, [resourcesExpenses, artifact, initialAmountItems, finiteAmountItems, factoryPrice])

  useEffect(() => {
    setProfit(calculateRevenue() - generalExpenses)
  }, [generalExpenses, realizationPrice, finiteAmountItems])

  useEffect(() => {
    setResourcesProfit(calculateResourcesProfit())
  }, [resourcesExpenses, finiteAmountItems])

  useEffect(() => {
    setFiniteAmountItems(calculateFiniteAmountItems())
  }, [returnPercent, initialAmountItems])

  function calculateRevenue () {
    return Math.floor(finiteAmountItems || 0) * ((realizationPrice || 0) - (realizationPrice || 0) * 0.065);
  }

  function calculateResourcesProfit () {
    return (finiteAmountItems - Math.floor(finiteAmountItems)) * resourcesExpenses
  }

  function calculateResourcesExpensesForOne () {
    return resources.reduce((acc, res) => (res.price||0) * (res.amount||0) + acc, 0)
  }

  function calculateGeneralExpenses () {
    return (resourcesExpenses * (initialAmountItems || 0)) 
      + ((artifact.price || 0) * (artifact.amount || 0) * Math.floor(finiteAmountItems)) 
      + (Math.floor(finiteAmountItems) * (factoryPrice || 0));
  }

  function calculateFiniteAmountItems () {
    let returnedResources = (initialAmountItems || 0) * ((returnPercent || 0)/100);
    let amountCrafted = initialAmountItems || 0;
    
    while (returnedResources >= 1) {
        amountCrafted += returnedResources
        returnedResources = returnedResources * ((returnPercent || 0)/100)
    }

    amountCrafted += returnedResources

    return amountCrafted;
  }

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

  const onClickAddPercent = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();

    if (additionalPercent && !returnPercentList.includes(additionalPercent)) {
      setReturnPercentList(prev => [...prev, additionalPercent].sort())
      setReturnPercent(additionalPercent)
      setTimeout(() => {
        setAdditionalPercent(undefined)
      }, 100);
    }
  }

  const onClickRemovePercent = (percent: number) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();

    if (returnPercentList.includes(percent)) {
      setReturnPercentList(prev => prev.filter(p => p !== percent))
    }
    if (returnPercent === percent) {
      setReturnPercent(undefined)
    }
  }

  const onClickResetData = () => {
    setResources(initData.resources)
    setArtifact(initData.artifact)
    setFactoryPrice(initData.factoryPrice)
    setRealizationPrice(initData.realizationPrice)
    setReturnPercent(initData.returnPercent)
    setInitialAmountItems(initData.initialAmountItems)
    setAdditionalPercent(undefined)
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

            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={onClickResetData}
            >
              <CachedIcon 
                sx={{ 
                  position: "absolute",
                  top: "14px",
                  left: "26px",
                  borderRadius: "50%",
                  color: "#1976d2",
                  background: "white",
                  border: "1px solid",
                  fontSize: "18px" 
                }}
              />

              <StorageIcon sx={{ fontSize: "28px" }} />
            </IconButton>

            <Button color="inherit">Login</Button>
          </Toolbar>
        </AppBar>
      </HideOnScroll>

      <Toolbar />

      <Container sx={{
        paddingTop: { xs: 0, md: 4 },
        paddingX: { xs: 1, sm: 2, md: 4 },
        marginTop: { xs: "-60px", md: 0 },
        paddingBottom: { xs: "75px", md: 0 }
      }}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4} md={true}>
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
                  InputLabelProps={{
                    sx: {
                      ...labelStyles,
                      backgroundColor: "#e5eef0",
                    },
                  }}
                  InputProps={{
                    sx: { 
                      backgroundColor: "#e5eef0",
                    },
                  }}
                />
              ))}

              <NumberFormat
                { ...numberFormatProps }
                color="primary"
                prefix="$ "
                label="Ціна артефакту"
                value={artifact.price}
                onValueChange={({ floatValue }) => onChangeArtifactHandler({ price: floatValue })}
                InputLabelProps={{
                  sx: { 
                    ...labelStyles,
                    backgroundColor: "#d0e0e3",
                  },
                }}
                InputProps={{
                  sx: { 
                    backgroundColor: "#d0e0e3",
                  },
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={12} sm={4} md={true}>
            <Item>
              {resources.map((resource, i) => (
                <NumberFormat
                  { ...numberFormatProps }
                  color="info"
                  label={`Кількість ресурсу ${i + 1}`}
                  key={`resources[${i}].amount`}
                  value={resource.amount}
                  onValueChange={({ floatValue }) => onChangeResourcesHandler({ amount: floatValue }, i)}
                  InputLabelProps={{
                    sx: {
                      ...labelStyles,
                      backgroundColor: "#f2e2e9",
                    },
                  }}
                  InputProps={{
                    sx: { 
                      backgroundColor: "#f2e2e9",
                    },
                  }}
                />
              ))}

              <NumberFormat
                { ...numberFormatProps }
                color="warning"
                label="Кількість артефакту"
                value={artifact.amount}
                onValueChange={({ floatValue }) => onChangeArtifactHandler({ amount: floatValue })}
                InputLabelProps={{
                  sx: {
                    ...labelStyles,
                    backgroundColor: "#ead1dc",
                  },
                }}
                InputProps={{
                  sx: { 
                    backgroundColor: "#ead1dc",
                  },
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={12} sm={4} md={true}>
            <Item>
              <NumberFormat
                { ...numberFormatProps }
                color="error"
                prefix="$ "
                label="Ціна виробництва"
                value={factoryPrice}
                onValueChange={onChangeHandler(setFactoryPrice)}
                InputLabelProps={{
                  sx: {
                    ...labelStyles,
                    backgroundColor: "#dae5fa",
                  },
                }}
                InputProps={{
                  sx: { 
                    backgroundColor: "#dae5fa",
                  },
                }}
              />

              <NumberFormat
                { ...numberFormatProps }
                color="secondary"
                prefix="$ "
                label="Ціна реалізації"
                value={realizationPrice}
                onValueChange={onChangeHandler(setRealizationPrice)}
                InputLabelProps={{
                  sx: {
                    ...labelStyles,
                    backgroundColor: "#f7e0d9",
                  },
                }}
                InputProps={{
                  sx: { 
                    backgroundColor: "#f7e0d9",
                  },
                }}
              />

              <FormControl fullWidth margin="normal" size="small">
                <InputLabel 
                  id="demo-simple-select-label"
                  sx={{
                    ...labelStyles,
                    backgroundColor: "#f6f6c2",
                  }}
                >
                  Відсоток повернення ресурсів
                </InputLabel>

                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Відсоток повернення ресурсів"
                  color="success"
                  sx={{ textAlign: "left", backgroundColor: "#f6f6c2", "& > .MuiSelect-select > button": { display: "none"} }}
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
                      suffix="%"
                      value={additionalPercent}
                      onValueChange={onChangeHandler(setAdditionalPercent)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">
                          <IconButton aria-label="delete" size="small" color="success" onClick={onClickAddPercent}>
                            <AddCircleRoundedIcon />
                          </IconButton>
                        </InputAdornment>,
                      }}
                    />
                  </MenuItem>

                  {returnPercentList.map(percent => ( 
                    <MenuItem key={percent} value={percent}>
                      <span style={{ opacity: '0' }}>-</span>{percent}%
                      <IconButton aria-label="delete" size="small" color="error" sx={{ marginLeft: "auto"}} onClick={onClickRemovePercent(percent)}>
                        <RemoveCircleRoundedIcon fontSize="small" />
                      </IconButton>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <NumberFormat
                { ...numberFormatProps }
                label="Загальні витрати"
                value={generalExpenses}
                variant="filled"
                InputProps={{
                  readOnly: true,
                  sx: { 
                    backgroundColor: "#fac0c0",
                  },
                }}
                sx={{ display: { xs: "block", sm: "none"}}}
              />

              <NumberFormat
                { ...numberFormatProps }
                label="К-сть артефактів"
                value={Math.floor(finiteAmountItems)}
                variant="filled"
                InputProps={{
                  readOnly: true,
                }}
                sx={{ display: { xs: "block", sm: "none"}}}
              />
            </Item>
          </Grid>

          <Grid item xs={12} sm={6} md={true}>
            <Item>
              <NumberFormat
                { ...numberFormatProps }
                label="Кількість елементів"
                value={initialAmountItems}
                onValueChange={onChangeHandler(setInitialAmountItems)}
                InputLabelProps={{
                  sx: {
                    ...labelStyles,
                    backgroundColor: "#e9d9f8",
                  },
                }}
                InputProps={{
                  sx: { 
                    backgroundColor: "#e9d9f8",
                  },
                }}
              />

              {resources.map((resource, i) => (
                <NumberFormat
                  { ...numberFormatProps }
                  label={`Загальна к-сть ${i+1} ресурсу`}
                  key={i}
                  value={(resource.amount || 0) * (initialAmountItems || 0)}
                  variant="filled"
                  InputProps={{
                    readOnly: true,
                  }}
                />
              ))}

              <NumberFormat
                { ...numberFormatProps }
                label="Кінцева к-сть елементів"
                value={finiteAmountItems}
                decimalScale={3}
                variant="filled"
                size="medium"
                InputProps={{
                  readOnly: true,
                  sx: { 
                    backgroundColor: "#f8f8d9",
                  },
                }}
              />
            </Item>
          </Grid>

          <Grid item xs={12} sm={6} md={true}>
            <Item>
              <NumberFormat
                { ...numberFormatProps }
                label="Загальний прибуток"
                value={profit + resourcesProfit}
                allowNegative 
                variant="filled"
                InputProps={{
                  readOnly: true,
                  sx: { 
                    backgroundColor: "#b7f7aa",
                    '&:hover': { backgroundColor: '#a2d498' },
                  },
                }}
              />

              <NumberFormat
                { ...numberFormatProps }
                label="Прибуток з продукції"
                value={profit}
                allowNegative
                variant="filled"
                InputProps={{
                  readOnly: true,
                  sx: { 
                    backgroundColor: "#def8d9",
                  },
                }}
              />

              <NumberFormat
                { ...numberFormatProps }
                label="Залишок ресурсів"
                value={resourcesProfit}
                allowNegative 
                variant="filled"
                InputProps={{
                  readOnly: true,
                  sx: { 
                    backgroundColor: "#def8d9",
                  },
                }}
              />

              <NumberFormat
                { ...numberFormatProps }
                label="Загальні витрати"
                value={generalExpenses}
                variant="filled"
                InputProps={{
                  readOnly: true,
                  sx: { 
                    backgroundColor: "#fac0c0",
                  },
                }}
                sx={{ display: { xs: "none", sm: "block"}}}
              />

              <NumberFormat
                { ...numberFormatProps }
                label="К-сть артефактів"
                value={Math.floor(finiteAmountItems)}
                variant="filled"
                InputProps={{
                  readOnly: true,
                }}
                sx={{ display: { xs: "none", sm: "block"}}}
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
