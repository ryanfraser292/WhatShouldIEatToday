import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Image, Button, TextInput, FlatList, SafeAreaView, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { AntDesign } from '@expo/vector-icons'; 
import * as SecureStore from 'expo-secure-store';
import 'firebase/firestore';
import * as firebase from 'firebase';
import {getFeaturedRecipes, searchRecipes} from './api.js';
import {Input} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import {Video} from 'expo-av';
import Constants from 'expo-constants';

const firebaseConfig = {
	apiKey: "AIzaSyBRPuMOV9NVr6GKCdJ4hvOHIzL5XnjpLGk",
    authDomain: "whatshouldieattoday-cddb0.firebaseapp.com",
    databaseURL: "https://whatshouldieattoday-cddb0.firebaseio.com",
    projectId: "whatshouldieattoday-cddb0",
    storageBucket: "whatshouldieattoday-cddb0.appspot.com",
    messagingSenderId: "585072169168",
    appId: "1:585072169168:web:7ce4c153c0c6753f1d0ed5"
};

firebase.initializeApp(firebaseConfig);
var database=firebase.firestore();

class Home extends React.Component {
	state ={
		recipes:[],
		savedRecipes:[]
	}

	refreshPage() {
		this.setState({recipes:[]});
  		this.updateRecipes().then(res => {window.location.reload(false);})
  	}

	updateRecipes = async() => {
		const recipeObject = await getFeaturedRecipes();
		for(var i=0;i<5;i++){
			this.setState(prevState=> ({
				recipes:[...prevState.recipes, recipeObject.recipes[i]]
			}))
		}
	}

	saveData = async(item) => {
		database.collection("testRecipes").add({
			title:item.title,
			sourceName:item.sourceName,
			image:item.image,
			sourceUrl:item.sourceUrl
		}).catch(function(error) {
			console.error("Error in saving data:", error);
		})
		console.log("Data Saved")
	}

	componentDidMount() {
		this.updateRecipes()
	}

	render() {
		if(this.state.recipes) {
			return(
			<View style={styles.container}>
				<View style={styles.container}>
					<View style={styles.featuredBanner}>
						<Text style={styles.featuredBannerText}>Featured</Text>
					</View>
				</View>
				<View style={styles.featurePage}>
					<FlatList
						style={{marginTop:10}}
						data={this.state.recipes}
						renderItem={({item})=>(
							<View style={{justifyContent:'center',marginBottom:10,borderRadius:10,backgroundColor:'#fff'}}>
								<View style={{flex:1, flexDirection:'row'}}>
									<View style={{padding:10}}>
										<Image source={{uri: item.image}} style={{height:200, width:200, padding:10}}/>
										<TouchableOpacity
											onPress={()=>{Linking.openURL(item.sourceUrl).catch(err=>console.err("Couldn't Load Page"));}}
											style={{padding:10,flex:1,backgroundColor:'#2E8B57',justifyContent:'center',alignItems: 'center', bottomBorderRadius: 50,}}>
											<Text style={{color:'white',fontSize:20, fontWeight:'bold'}}>Go To Recipe</Text>
										</TouchableOpacity>
									</View>
									<View style={{flexDirection:'column', flex:1, padding:10}}>
										<Text style={{padding:10, flexGrow:4, fontWeight:'bold',fontSize:20}}>{item.title}</Text>
										<Text style={{padding:10, flex:4, fontSize:20}}>From: {item.sourceName}</Text>
										<Text style={{padding:10, flex:4}}>Ready In: {item.readyInMinutes} Min.</Text>
										<TouchableOpacity
											onPress={()=> {this.saveData(item)}}
											style={{padding:10, flex:4, backgroundColor:'#2E8B57',justifyContent:'center',alignItems: 'center',borderRadius: 50,}}>
											<Text style={{color:'white', fontSize:20, fontWeight:'bold',}}>Save</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						)}
					/>
					<View style={{padding:10}}>
						<TouchableOpacity
							onPress={()=>{this.refreshPage()}}
							style={{padding:5, backgroundColor:'#fff',justifyContent:'center',alignItems:'center',borderRadius:100}}>
							<Text style={{padding:5, fontWeight:'bold', color:"#2E8B57"}}>Refresh</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
			);
		} else {
			return(
			<View style={styles.container}>
				<View style={styles.container}>
					<View style={styles.featuredBanner}>
						<Text style={styles.featuredBannerText}>Loading...</Text>
					</View>
				</View>
			</View>
			);
		}
	}
}

class Search extends React.Component {
	state ={
		recipes:[],
		savedRecipes:[],
		query:'',
		fullresult:[],
	}

	refreshPage(text) {
		this.setState({recipes:[]})
 	 	this.handleSearch(text).then(res=>{window.location.reload(false);})
  	}

	saveData = async(item) => {
		database.collection("testRecipes").add({
			title:item.title,
			image:this.state.fullresult.baseUri+item.image,
			sourceUrl:item.sourceUrl
		}).catch(function(error) {
			console.error("Error in saving data:", error);
		})
		console.log("Data Saved")
	}

	handleSearch = async(text) => {
	 	const searchResultsObject = await searchRecipes(text);
	 	this.setState({fullresult:searchResultsObject});
	 	for(var i=0;i<5;i++){
	 		this.setState(prevState=>({
	 			recipes:[...prevState.recipes, searchResultsObject.results[i]]
	 		}))
	 	}
	 	console.log(this.state.fullresult);
	}

	render() {
		return (
	 	<View style={styles.container}>
	 		<View style={styles.container}>
	 			<View style={styles.featuredBanner}>
	 				<Text style={styles.featuredBannerText}>Search</Text>
	 			</View>
	 		</View>
	 		<View style={styles.featurePage}>
	 			<View style={{padding:10, flexDirection:'column',flex:1}}>
			 		<TextInput 
			 			placeholder="	Burgers and Fries..."
			 			onChangeText={text=>this.setState({query:text})}
			 			style={{
			 				flex:1,
			 				backgroundColor:'#fff',
			 				borderRadius:50,
			 				fontSize:25,
			 			}}
			 		/>
			 		<View style={{padding:10,flex:8}}>
			 			<FlatList
						style={{marginTop:10}}
						data={this.state.recipes}
						renderItem={({item})=>(
							<View style={{justifyContent:'center',marginBottom:10,borderRadius:10,backgroundColor:'#fff'}}>
								<View style={{flex:1, flexDirection:'row'}}>
									<View style={{padding:10}}>
										<Image source={{uri: this.state.fullresult.baseUri+item.image}} style={{height:200, width:200, padding:10}}/>
										<TouchableOpacity
											onPress={()=>{Linking.openURL(item.sourceUrl).catch(err=>console.err("Couldn't Load Page"));}}
											style={{padding:10,flex:1,backgroundColor:'#2E8B57',justifyContent:'center',alignItems: 'center', bottomBorderRadius: 50,}}>
											<Text style={{color:'white',fontSize:20, fontWeight:'bold'}}>Go To Recipe</Text>
										</TouchableOpacity>
									</View>
									<View style={{flexDirection:'column', flex:1, padding:10}}>
										<Text style={{padding:10, flexGrow:3, fontWeight:'bold',fontSize:20}}>{item.title}</Text>
										<Text style={{padding:10, flex:3}}>Ready In: {item.readyInMinutes} Min.</Text>
										<TouchableOpacity
											onPress={()=> {this.saveData(item)}}
											style={{padding:10, flex:3, backgroundColor:'#2E8B57',justifyContent:'center',alignItems: 'center',borderRadius: 50,}}>
											<Text style={{color:'white', fontSize:20, fontWeight:'bold',}}>Save</Text>
										</TouchableOpacity>
									</View>
								</View>
							</View>
						)}
					/>
			 		</View>
			 		<View style={{padding:10,flex:1}}>
						<TouchableOpacity
							onPress={()=>{this.refreshPage(this.state.query)}}
							style={{padding:5, backgroundColor:'#fff',justifyContent:'center',alignItems:'center',borderRadius:100}}>
							<Text style={{padding:5, fontWeight:'bold', color:"#2E8B57"}}>Search</Text>
						</TouchableOpacity>
					</View>
	 			</View>
	 		</View>
	 	</View>
	 	);
	 }
}

class Log extends React.Component {
	state = {
		Description:'',
		Calories:'',
		Carbohydrates:'',
		Protein:'',
		Fats:'',
		Image:null,
		savedData:[],
	}

	ImagePicker() {
		const [image, setImage] = useState(null);
		useEffect(() => {(async () => {
      		if (Platform.OS !== 'web') {
        		const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
        	if (status !== 'granted') {
          		alert('Sorry, we need camera roll permissions to make this work!');
        		}
      		}
    		})();
  		}, []);


	  const pickImage = async () => {
	    let result = await ImagePicker.launchImageLibraryAsync({
	      mediaTypes: ImagePicker.MediaTypeOptions.All,
	      allowsEditing: true,
	      aspect: [4, 3],
	      quality: 1,
	    });

	    console.log(result);

	    if (!result.cancelled) {
	      setImage(result.uri);
	      this.setState({Image:result.uri});
	    }

	}
};

	getData = async() =>{
     try{
      database.collection("testMealLogs").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState(prevState=>({
            savedData:[...prevState.savedData, {
            	Description:doc.data().Description, 
				Calories:doc.data().Calories,
				Carbohydrates:doc.data().Carbohydrates,
				Protein:doc.data().Protein,
				Fats:doc.data().Fats,
				Image:doc.data().image,
			}]
          }))
        })
      });    
    }catch (e){
      console.error(e)
    }
    console.log(this.state.savedData);
  	}

	saveData = async() => {
		database.collection("testMealLogs").add({
			Description:this.state.Description,
			Calories:this.state.Calories,
			Carbohydrates:this.state.Carbohydrates,
			Protein:this.state.Protein,
			Fats:this.state.Fats,
			image:this.state.Image,
		}).catch(function(error) {
			console.error("Error in saving data:", error);
		})
		console.log("Data Saved")
	}
	componentDidMount() {
		this.getData();
		console.log(this.state.savedData);
	}

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.container}>
					<View style={styles.featuredBanner}>
						<Text style={styles.featuredBannerText}>Log Your Meal!</Text>
					</View>
				</View>
				<View style={styles.featurePage}>
					<View style={{padding:5, flex:1}}>
						<TextInput
							placeholder="	Description..."
							onChangeText={text=>this.setState({Description:text})}
							style={{
								flex:1,
								backgroundColor:'#fff',
								borderRadius:50,
								fontSize:20,
							}}
						/>
					</View>
					<View style={{padding:5, flex:1, flexDirection:'row'}}>
						<View style={{padding:5,flex:2}}>
							<TextInput 
					 			placeholder="	Calories"
					 			onChangeText={text=>this.setState({Calories:text})}
					 			style={{
					 				flex:1,
					 				backgroundColor:'#fff',
					 				borderRadius:50,
					 				fontSize:20,
					 			}}
			 				/>
						</View>
						<View style={{padding:5,flex:2}}>
							<TextInput 
					 			placeholder="	Carbs"
					 			onChangeText={text=>this.setState({Carbohydrates:text})}
					 			style={{
					 				flex:1,
					 				backgroundColor:'#fff',
					 				borderRadius:50,
					 				fontSize:20,
					 			}}
			 				/>
						</View>
					</View>
					<View style={{padding:2.5, flex:1, flexDirection:'row'}}>
						<View style={{padding:5,flex:2}}>
							<TextInput 
					 			placeholder="	Protein"
					 			onChangeText={text=>this.setState({Protein:text})}
					 			style={{
					 				flex:1,
					 				backgroundColor:'#fff',
					 				borderRadius:50,
					 				fontSize:20,
					 			}}
			 				/>
						</View>
						<View style={{padding:5,flex:2}}>
							<TextInput 
					 			placeholder="	Fats"
					 			onChangeText={text=>this.setState({Fats:text})}
					 			style={{
					 				flex:1,
					 				backgroundColor:'#fff',
					 				borderRadius:50,
					 				fontSize:20,
					 			}}
			 				/>
						</View>
					</View>
					<View style={{padding:2.5,flex:1}}>
						<TouchableOpacity
							style={{padding:5, backgroundColor:'#fff',justifyContent:'center',alignItems:'center',borderRadius:100}}
							onPress={()=>{this.ImagePicker()}}>
							<Text style={{padding:5, fontWeight:'bold', color:"#2E8B57"}}>Add Photo</Text>
						</TouchableOpacity>
					</View>
					<View style={{padding:2.5,flex:1}}>
						<TouchableOpacity
							onPress={()=>{this.saveData();}}
							style={{padding:5, backgroundColor:'#fff',justifyContent:'center',alignItems:'center',borderRadius:100}}>
							<Text style={{padding:5, fontWeight:'bold', color:"#2E8B57"}}>Log</Text>
						</TouchableOpacity>
					</View>
						<View style={{padding:5,flex:5}}>
							<FlatList
								style={{marginTop:5}}
								data={this.state.savedData}
								renderItem={({item})=>(
									<View style={{padding:5}}>
										<View style={{padding:5,flex:1,backgroundColor:'#fff',justifyContent:'center',alignItems: 'center', borderRadius: 10,}}>
											<View style={{flex:1,flexDirection:'row', padding:10}}>
												<Image source={{uri:item.Image}} style={{height:60, width:60, padding:10}}/>
												<View style={{flex:1,flexDirection:'column'}}>
													<Text style={{padding:1}}>Description: {item.Description}</Text>
													<Text style={{padding:1}}>Calories: {item.Calories}</Text>
													<Text style={{padding:1}}>Carbohydrates: {item.Carbohydrates}</Text>
													<Text style={{padding:1}}>Protein: {item.Protein}</Text>
													<Text style={{padding:1}}>Fats: {item.Fats}</Text>
												</View>
											</View>
										</View>
									</View>
								)}
					/>
						</View>
					</View>
			</View>
			)
	}
}

class Saved extends React.Component {
	state = {
		savedData:[]
	}

	getData = async() =>{
     try{
      database.collection("testRecipes").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.setState(prevState=>({
            savedData:[...prevState.savedData, {
            	title:doc.data().title, 
				sourceName:doc.data().sourceName,
				image:doc.data().image,
				sourceUrl:doc.data().sourceUrl
			}]
          }))
        })
      });    
    }catch (e){
      console.error(e)
    }
  	}

  	removeData = async(item) => {
  		database.collection("testRecipes").where("title","==",item).get().then((querySnapshot)=>{
  			querySnapshot.forEach((doc)=>{
  				doc.ref.delete();
  			})
  		})
  		this.refreshPage();
  	}

  	refreshPage() {
  		this.setState({savedData:[]})
  		this.getData().then(res => {window.location.reload(false);})
  	}

  	componentDidMount(){
  		this.getData();
 	}
	render() {
		return (
			<View style={styles.container}>
				<View style={styles.container}>
					<View style={styles.featuredBanner}>
						<Text style={styles.featuredBannerText}>Saved Recipes!</Text>
					</View>
				</View>
				<View style={styles.featurePage}>
					<FlatList
						style={{marginTop:5}}
						data={this.state.savedData}
						renderItem={({item})=>(
							<View style={{padding:5}}>
								<TouchableOpacity 
									onPress={()=>{Linking.openURL(item.sourceUrl).catch(err=>console.err("Couldn't Load Page"));}}
									style={{padding:5,flex:1,backgroundColor:'#fff',justifyContent:'center',alignItems: 'center', borderRadius: 10,}}>
									<View style={{flex:1,flexDirection:'row', padding:10}}>
										<Image source={{uri:item.image}} style={{height:60, width:60, padding:10}}/>
										<View style={{flex:1,flexDirection:'column'}}>
											<Text style={{padding:5, fontWeight:'bold'}}>{item.title}</Text>
											<View style={{flex:1,flexDirection:'row'}}>
												<Text style={{padding:5}}>{item.sourceName}</Text>
												<TouchableOpacity
													onPress={()=>{this.removeData(item.title)}}
													style={{padding:1, backgroundColor:"#2E8B57",justifyContent:'center',alignItems:'center', borderRadius:5,flexDirection:'flex-end'}}>
													<Text style={{padding:1, color:"#fff"}}>Delete</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</TouchableOpacity>
							</View>
						)}
					/>
					<View style={{padding:10}}>
						<TouchableOpacity
							onPress={()=>{this.refreshPage()}}
							style={{padding:5, backgroundColor:'#fff',justifyContent:'center',alignItems:'center',borderRadius:100}}>
							<Text style={{padding:5, fontWeight:'bold', color:"#2E8B57"}}>Refresh</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		)
	}
} 


class HomeScreenSet extends React.Component {
	componentDidMount() {
		//console.log("First Screen Mounted");
	}

	render() {
		const Stack = createStackNavigator();
		return (
			<Stack.Navigator initialRouteName="Home" mode="modal">
				<Stack.Screen
					name="Home"
					component={Home}
					options={{
						title:"What Should I Eat Today?",
						headerTitleStyle:{
                			fontWeight:'bold'
              			},
              			headerStyle:{
                			backgroundColor: "#2E8B57"
              			},
              			headerTintColor: "white",
					}}
				/>
			</Stack.Navigator>
		)
	}
}

class SearchScreenSet extends React.Component {
	componentDidMount() {
		//console.log("Search Screens Mounted");
	}

	render() {
		const Stack = createStackNavigator();
		return(
			<Stack.Navigator initialRouteName="Search" mode="modal">
				<Stack.Screen
					name="Search"
					component={Search}
					options={{
						title:"What Should I Eat Today?",
						headerTitleStyle:{
                			fontWeight:'bold'
              			},
              			headerStyle:{
                			backgroundColor: "#2E8B57"
              			},
              			headerTintColor: "white",
					}}
				/>
			</Stack.Navigator>
			)
	}
}

class LogScreenSet extends React.Component {
	componentDidMount() {
		//console.log("Log Screens Mounted");
	}

	render() {
		const Stack = createStackNavigator();
		return(
			<Stack.Navigator initialRouteName="Log" mode="modal">
				<Stack.Screen
					name="Log"
					component={Log}
					options={{
						title:"What Should I Eat Today?",
						headerTitleStyle:{
                			fontWeight:'bold'
              			},
              			headerStyle:{
                			backgroundColor: "#2E8B57"
              			},
              			headerTintColor: "white",
					}}
				/>
			</Stack.Navigator>
			)
	}
}

class SavedScreenSet extends React.Component {
	componentDidMount() {
		//console.log("Saved Screens Mounted");
	}

	render() {
		const Stack = createStackNavigator();
		return(
			<Stack.Navigator initialRouteName="Saved" mode="modal">
				<Stack.Screen
					name="Saved"
					component={Saved}
					options={{
						title:"What Should I Eat Today?",
						headerTitleStyle:{
                			fontWeight:'bold'
              			},
              			headerStyle:{
                			backgroundColor: "#2E8B57"
              			},
              			headerTintColor: "white",
					}}
				/>
			</Stack.Navigator>
			)
	}
}

export default class App extends React.Component {
component() {
	console.log("All Screens Loaded");
}

render() {
	const Tab = createBottomTabNavigator();
      return (
      	<NavigationContainer>
      		<Tab.Navigator
      			initialRoutename="HomeScreenSet"
      			tabBarOptions={{
      				activeTintColor: '#2E8B57',
      				inactiveTintColor: 'grey',
      			}}>
      			<Tab.Screen
      				name="Home"
      				component={HomeScreenSet}
      				options={{
      					tabBarIcon:({color})=>(<MaterialCommunityIcons name="home" size={32} color={color} />)
      				}}
      			/>
      			<Tab.Screen
      				name="Search"
      				component={SearchScreenSet}
      				options={{
      					tabBarIcon:({color})=>(<MaterialCommunityIcons name="magnify" size={32} color={color} />)
      				}}
      			/>
      			<Tab.Screen
      				name="Log"
      				component={LogScreenSet}
      				options={{
      					tabBarIcon:({color})=>(<MaterialCommunityIcons name="book-open-variant" size={32} color={color} />)
      				}}
      			/>
      			<Tab.Screen
      				name="Saved"
      				component={SavedScreenSet}
      				options={{
      					tabBarIcon:({color})=>(<MaterialCommunityIcons name="star" size={32} color={color} />)
      				}}
      			/>
      		</Tab.Navigator>
      	<View></View>
      	</NavigationContainer>
      );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },featuredBanner: {
  	flex:1,
  	backgroundColor: '#fff',
  	alignItems: 'center',
  	justifyContent: 'center',
  },featurePage: {
  	flex:9,
  	backgroundColor:'#2E8B57',
  },featuredBannerText:{
  	color:"#2E8B57",
  	fontWeight:"bold",
  	fontSize:25,
  } 
});
