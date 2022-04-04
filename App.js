import {StatusBar} from 'expo-status-bar';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import Config from './config'
import {useState} from "react";
import AppLoading from "expo-app-loading";
import * as Location from 'expo-location';
import {useFonts} from "expo-font";
import {LinearGradient} from "expo-linear-gradient";
import Icons from "./assets/icons/main"
import {AntDesign, Entypo, EvilIcons, FontAwesome5, Ionicons, MaterialIcons} from "@expo/vector-icons";

function getDirection(degrees) {
    if (degrees >= 0 && degrees < 90) {
        return `N`;
    } else if (degrees >= 90 && degrees < 180) {
        return 'E';
    } else if (degrees >= 180 && degrees < 270) {
        return 'S';
    } else if (degrees >= 270 && degrees < 360) {
        return 'W';
    } else {
        return 'N';
    }
}
function GenerateTemp ({temp, style={}, styleC={}}){
    return <View style={{flexDirection: "row"}}>
        <Text style={[styles.text, {fontSize: 80, fontFamily: "SF-Pro-Display-Bold"}, style]}>{Math.round(temp)}</Text>
        <Text style={[styles.text, {color: "#f5c112", fontSize: 30, top: 30, fontFamily: "SF-Pro-Display-Bold"}, styleC]}>°C</Text>
    </View>
}
function GenerateText ({textOne, textTwo, icon}){
    return <View style={{flexDirection: "row"}}>
        {icon && icon}
        <Text style={[styles.text, {fontFamily: "SF-Pro-Display-Bold"}, icon ? {marginLeft: 1}: {}]}>{textOne}:</Text>
        <Text style={[styles.text, {color: "#f5c112", marginLeft: 5}]}>{textTwo}</Text>
    </View>
}
function GenerateCard (props) {
    return <View style={{
        borderRadius: 12,
        padding: 17,
        minHeight: 50,
        marginTop: 20,
        backgroundColor: "#1b1c48"
    }}>
        {props.children}
    </View>
}
function convertMeterToKm(meter){
    return Math.round(meter/1000)
}
function convertMeterSecToKmH(meterSec){
    return Math.round(meterSec*3.6)
}
function convertUnixUTC(unix_timestamp) {
    var date = new Date(unix_timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var seconds = "0" + date.getSeconds();
    return (hours >= 10 ? hours : '0' + hours) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

export default function App() {
    const [ isReady, setIsReady ] = useState(false)
    const [ data, setData ] = useState(null)
    let [fontsLoaded] = useFonts({
        'SF-Pro-Display-Bold': require('./assets/fonts/SF-Pro-Display-Bold.otf'),
        'SF-Pro-Display-Regular': require('./assets/fonts/SF-Pro-Display-Regular.otf'),
    });

    const fetchData = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') setData({error: 'Permission to access location was denied'});
        else {
            let location = await Location.getCurrentPositionAsync({});
            setData(location);
            try {
                let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${Config.TOKEN}&units=metric&lang=pl`);
                let json = await response.json();
                if (json.cod !== 200) setData({error: json.message});
                else setData(json);
            }catch (e) {
                setData({error: e.message});
            }
        }
    };

    const getDate = (h) => {
        const months = {
            1: 'stycznia',
            2: 'lutego',
            3: 'marca',
            4: 'kwietnia',
            5: 'maja',
            6: 'czerwca',
            7: 'lipca',
            8: 'sierpnia',
            9: 'września',
            10: 'października',
            11: 'listopada',
            12: 'grudnia'
        }
        const days = {
            0: 'Nied',
            1: 'Pon',
            2: 'Wt',
            3: 'Śr',
            4: 'Czw',
            5: 'Pi',
            6: 'Sob'
        }
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        if (!h) return `${days[date.getDay()]} ,${day} ${months[month]}`
    }

    if (data && data.error) return <View style={[styles.container, {alignItems: 'center', justifyContent: 'center',}]}>
        <Entypo name="emoji-sad" size={100} color="#f5c112" />
        <Text style={[styles.text, {color: "#f65e5e", fontSize: 40, textAlign: "center"}]}>{data.error}</Text>
    </View>

    if (!isReady || !data || !fontsLoaded) return <AppLoading
        startAsync={fetchData}
        onFinish={() => setIsReady(true)}
        onError={console.warn}
    />


    return <View style={styles.container}>
        <LinearGradient colors={['#1b1c48', '#2b2656']} start={{x: 0, y:0}} end={{x: 1, y:1}} style={{
            borderRadius: 12,
            padding: 17,
            minHeight: 180,
        }}>
            <View style={{flexDirection: "row"}}>
                <Text style={[styles.text, {color: "#FFF", fontFamily: "SF-Pro-Display-Bold"}]}>Dzisiaj</Text>
                <Text style={[styles.text, {color: "#FFF", position: 'absolute', right: 10, fontFamily: "SF-Pro-Display-Bold"}]}>{getDate()}</Text>
            </View>
            <View style={{flexDirection: "row", marginTop: 20}}>
                <GenerateTemp temp={data.main.temp} style={{marginLeft: 10}}/>
                <Image source={Icons[data.weather[0].icon]} style={{height: 120, width: 120, position: 'absolute', right: 10}}/>
            </View>
            <View style={{flexDirection: "row", }}>
                <EvilIcons name="location" size={36} color="#f5c112" />
                <Text style={[styles.text, {color: "rgba(255,255,255,0.7)"}]}>{data.name}</Text>
            </View>
        </LinearGradient>

        <ScrollView>
            <GenerateCard>
                <GenerateText
                    icon={<Entypo name="text" size={28} color="#f5c112"  />}
                    textOne={"Opis"}
                    textTwo={data.weather[0].description}
                />
                <GenerateText
                    icon={
                        data.main.feels_like >= 15 ?
                            <FontAwesome5 name="temperature-high" size={28} color="#f5c112" />
                            :
                            <FontAwesome5 name="temperature-low" size={28} color="#f5c112" />
                    }
                    textOne={"Temp. odczuwalna"}
                    textTwo={`${data.main.feels_like}°C`}
                />
                <GenerateText
                    icon={<AntDesign name="cloud" size={28} color="#f5c112" />}
                    textOne={"Ciśnienie"}
                    textTwo={`${data.main.pressure} hPa`}
                />
                <GenerateText
                    icon={<Ionicons name="water" size={28} color="#f5c112" />}
                    textOne={"Wilgotność"}
                    textTwo={`${data.main.humidity}%`}
                />
                <GenerateText
                    icon={<MaterialIcons name="visibility" size={28} color="#f5c112" />}
                    textOne={"Widoczność"}
                    textTwo={`${convertMeterToKm(data.visibility)}km`}
                />

            </GenerateCard>
            {
                data.wind &&
                <GenerateCard>
                    <GenerateText
                        icon={<FontAwesome5 name="wind" size={28} color="#f5c112" />}
                        textOne={"Wiatr"}
                        textTwo={`${convertMeterSecToKmH(data.wind.speed)} km/h`}
                    />
                    <GenerateText
                        icon={<FontAwesome5 name="compass" size={28} color="#f5c112" />}
                        textOne={"Kierunek"}
                        textTwo={`${data.wind.deg}° ${getDirection(data.wind.deg)}`}
                    />
                </GenerateCard>
            }
            {
                data.weather[0].main.toLowerCase() === "rain" &&
                <GenerateCard>
                    <GenerateText
                        icon={<FontAwesome5 name="cloud-rain" size={28} color="#f5c112" />}
                        textOne={"Opady"}
                        textTwo={`${data.rain["1h"]}mm/h`}
                    />
                </GenerateCard>
            }
            {
                data.weather[0].main.toLowerCase() === "snow" &&
                <GenerateCard>
                    <GenerateText
                        icon={<FontAwesome5 name="snowflake" size={28} color="#f5c112" />}
                        textOne={"Opady"}
                        textTwo={`${data.snow["1h"]}mm/h`}
                    />
                </GenerateCard>
            }
            {
                data.weather[0].main.toLowerCase() === "clear" &&
                <GenerateCard>
                    <GenerateText
                        icon={<FontAwesome5 name="sun" size={28} color="#f5c112" />}
                        textOne={"Wschód"}
                        textTwo={`${convertUnixUTC(data.sys.sunrise)}`}
                    />
                    <GenerateText
                        icon={<FontAwesome5 name="moon" size={28} color="#f5c112" />}
                        textOne={"Zachód"}
                        textTwo={`${convertUnixUTC(data.sys.sunset)}`}
                    />
                </GenerateCard>
            }
            {
                data.weather[0].main.toLowerCase() === "clouds" &&
                <GenerateCard>
                    <GenerateText
                        icon={<FontAwesome5 name="cloud" size={28} color="#f5c112" />}
                        textOne={"Wschód"}
                        textTwo={`${convertUnixUTC(data.sys.sunrise)}`}
                    />
                    <GenerateText
                        icon={<FontAwesome5 name="moon" size={28} color="#f5c112" />}
                        textOne={"Zachód"}
                        textTwo={`${convertUnixUTC(data.sys.sunset)}`}
                    />
                </GenerateCard>
            }
        </ScrollView>
        <StatusBar style="auto" />
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#11123e',
        paddingTop: 50,
        paddingLeft: 16,
        paddingRight: 16,
    },
    text : {
        fontFamily: 'SF-Pro-Display-Regular',
        fontSize: 20,
        color: '#FFF'
    }
});
