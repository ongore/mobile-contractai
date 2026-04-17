import React, {useRef, useState, useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Dimensions, Animated, Image, ViewToken,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {PreAuthStackParamList} from '@/navigation/types';
import {useAuthStore} from '@/store/authStore';

const {width, height} = Dimensions.get('window');
const CONTENT_W = width - 48;

const TOPBAR_H = 72;
const FOOTER_H = 144;

const BG       = '#F7F5F2';
const WHITE    = '#FFFFFF';
const INK      = '#111111';
const GRAY     = '#8C8C8C';
const GRAY_L   = '#D4D0CA';
const ORANGE   = '#FF5C28';
const ORANGE_L = '#FFF0EB';

// ─── World map bitmap ─────────────────────────────────────────────────────────
// 32 cols (180°W → 180°E) × 14 rows (80°N → 50°S), '1' = land
const MAP_ROWS = [
  '00000000111100001111111111110000', // 80°N: Greenland, N Russia
  '01110111110011111111111111110000', // 70°N: Alaska, Canada, Iceland, Russia
  '00111111111011011111111111111000', // 60°N: W Canada, UK, Scandinavia, Russia
  '00001111110001111111111100000000', // 50°N: Canada, UK, C Europe, Russia
  '00001111110001111111111111100000', // 40°N: USA, Europe, Turkey, China, Japan
  '00000011110001111111111110000000', // 30°N: SE USA, N Africa, Arabia, India, China
  '00000011000001111111111100000000', // 20°N: Mexico, Africa, India, SE Asia
  '00000001110001111111001100000000', // 10°N: C America, Africa, India
  '00000000110000111110000011100000', // 0°:   N S.America, C Africa, Indonesia
  '00000000011000011110000011110000', // 10°S: Brazil, S Africa, Indonesia
  '00000000011000011100000001111000', // 20°S: Brazil, S Africa, Australia
  '00000000011000001100000001111000', // 30°S: Argentina, S Africa, Australia
  '00000000011000000000000000111000', // 40°S: Argentina, S Australia
  '00000000010000000000000000000000', // 50°S: S Argentina
];

const NCOLS = 32;
const NROWS = 14;
const CW    = 10;  // px per col
const CH    = 12;  // px per row

// Pre-build all dots at module level — no render-time computation
interface MDot { x: number; y: number; land: boolean; }
const ALL_MAP_DOTS: MDot[] = [];
MAP_ROWS.forEach((row, r) => {
  for (let c = 0; c < NCOLS; c++) {
    ALL_MAP_DOTS.push({
      x: c * CW + (r % 2 === 1 ? CW / 2 : 0),
      y: r * CH,
      land: row[c] === '1',
    });
  }
});

// Orange accent dots at key geo positions
const ACCENT_MAP_DOTS = [
  {c:8,  r:5},  // SE USA
  {c:15, r:5},  // NW Europe
  {c:20, r:7},  // E Africa
  {c:28, r:10}, // Australia (Sydney area)
].map(({c, r}) => ({
  x: c * CW + (r % 2 === 1 ? CW / 2 : 0),
  y: r * CH,
}));

// ─── Dot grid (slide background) ─────────────────────────────────────────────
function DotGrid() {
  return (
    <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,overflow:'hidden'}} pointerEvents="none">
      {Array.from({length:10}).map((_,r)=>Array.from({length:14}).map((_,c)=>(
        <View key={`${r}-${c}`} style={{
          position:'absolute', width:3.5, height:3.5, borderRadius:99,
          backgroundColor:'rgba(0,0,0,0.06)',
          top: r*28+(c%2===0?0:14), left: c*22,
        }}/>
      )))}
    </View>
  );
}

const CARD_SHADOW = {
  shadowColor:'#000', shadowOffset:{width:0,height:5},
  shadowOpacity:0.10, shadowRadius:16, elevation:7,
};

// ─── SLIDE 1 ──────────────────────────────────────────────────────────────────
function ContractArtifact() {
  return (
    <View style={{width: CONTENT_W, height: 220}}>
      {/* Faint circle behind */}
      <View style={{
        position:'absolute',
        width:200, height:200, borderRadius:100,
        borderWidth:1.5, borderColor:'rgba(0,0,0,0.07)',
        top:5, left:CONTENT_W/2-100,
      }}/>

      {/* LEFT floating card */}
      <View style={[{
        position:'absolute', left:-6, top:28, width:148,
        backgroundColor:WHITE, borderRadius:16, padding:14,
        transform:[{rotate:'-4deg'}], zIndex:1,
      }, CARD_SHADOW]}>
        <View style={{flexDirection:'row',alignItems:'center',gap:6,marginBottom:8}}>
          <View style={{width:7,height:7,borderRadius:99,backgroundColor:ORANGE}}/>
          <Text style={{fontSize:9,fontWeight:'800',color:INK,letterSpacing:0.4}}>ACTIVE CONTRACT</Text>
        </View>
        <Text style={{fontSize:13,fontWeight:'700',color:INK,marginBottom:2}} numberOfLines={1}>Acme Corp NDA</Text>
        <Text style={{fontSize:11,color:GRAY,marginBottom:10}}>Signed · Nov 2025</Text>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
          <View style={{backgroundColor:ORANGE_L,borderRadius:99,paddingHorizontal:8,paddingVertical:4,borderWidth:1,borderColor:'rgba(255,92,40,0.2)'}}>
            <Text style={{fontSize:10,fontWeight:'800',color:ORANGE}}>$4,800/mo</Text>
          </View>
          <Icon name="check-circle" size={16} color="#16A34A"/>
        </View>
      </View>

      {/* RIGHT list card */}
      <View style={[{
        position:'absolute', right:0, top:0, width:168,
        backgroundColor:WHITE, borderRadius:16, padding:12,
        zIndex:2,
      }, CARD_SHADOW]}>
        {[
          {dot:ORANGE,    title:'Service Agreement', meta:'Freelance'},
          {dot:'#8B5CF6', title:'NDA — Acme Corp',   meta:'14 Nov 2025'},
          {dot:'#10B981', title:'Payment Terms',     meta:'Net-30'},
          {dot:'#F59E0B', title:'Freelance Deal',    meta:'8 Dec 2025'},
        ].map((item,i)=>(
          <View key={i} style={[
            {flexDirection:'row',alignItems:'center',paddingVertical:9,gap:9},
            i>0&&{borderTopWidth:1,borderTopColor:'#F4F2EF'},
          ]}>
            <View style={{width:6,height:6,borderRadius:99,backgroundColor:item.dot}}/>
            <View style={{flex:1}}>
              <Text style={{fontSize:11.5,fontWeight:'600',color:INK}} numberOfLines={1}>{item.title}</Text>
              <Text style={{fontSize:10,color:GRAY}}>{item.meta}</Text>
            </View>
            <Icon name="chevron-right" size={11} color={GRAY_L}/>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── SLIDE 2 ──────────────────────────────────────────────────────────────────
const PORT_W = 68;
const PORT_H = 96;

function MapArtifact() {
  const mapW = NCOLS * CW + CW / 2;
  const mapH = NROWS * CH;

  return (
    <View style={{alignItems:'center', gap:0}}>

      {/* Fanned portrait cards */}
      <View style={{width:260, height:120, marginBottom:4}}>
        {/* Far-left */}
        <View style={{position:'absolute',left:0,top:28,width:PORT_W,height:PORT_H,borderRadius:14,backgroundColor:'#C8C4BE',transform:[{rotate:'-16deg'}]}}/>
        {/* Left */}
        <View style={{position:'absolute',left:44,top:14,width:PORT_W,height:PORT_H,borderRadius:14,backgroundColor:'#DDD9D3',transform:[{rotate:'-8deg'}]}}/>
        {/* Center — front, white, with icon */}
        <View style={[{
          position:'absolute',left:96,top:0,
          width:PORT_W,height:PORT_H,borderRadius:14,
          backgroundColor:WHITE,
          alignItems:'center',justifyContent:'center',gap:4,
          zIndex:5,
        }, CARD_SHADOW]}>
          <Icon name="file-document-outline" size={26} color={ORANGE}/>
          <Text style={{fontSize:8,fontWeight:'800',color:INK,letterSpacing:0.5,textAlign:'center'}}>CONTRACT{'\n'}DRAFT</Text>
        </View>
        {/* Right */}
        <View style={{position:'absolute',right:44,top:14,width:PORT_W,height:PORT_H,borderRadius:14,backgroundColor:'#DDD9D3',transform:[{rotate:'8deg'}]}}/>
        {/* Far-right */}
        <View style={{position:'absolute',right:0,top:28,width:PORT_W,height:PORT_H,borderRadius:14,backgroundColor:'#C8C4BE',transform:[{rotate:'16deg'}]}}/>
      </View>

      {/* World map dot grid */}
      <View style={{width:mapW, height:mapH, position:'relative'}}>

        {ALL_MAP_DOTS.map((d, i) => (
          <View key={i} style={{
            position:'absolute',
            left: d.x, top: d.y,
            width:4, height:4, borderRadius:99,
            backgroundColor: d.land ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.05)',
          }}/>
        ))}

        {ACCENT_MAP_DOTS.map((d, i) => (
          <View key={`a${i}`} style={{
            position:'absolute',
            left: d.x - 3, top: d.y - 3,
            width:8, height:8, borderRadius:99,
            backgroundColor:ORANGE,
          }}/>
        ))}

        {/* Location badge */}
        <View style={{
          position:'absolute', bottom:10, left:6,
          flexDirection:'row', alignItems:'center', gap:6,
          backgroundColor:WHITE, borderRadius:99,
          paddingHorizontal:12, paddingVertical:7,
          ...CARD_SHADOW, shadowOpacity:0.07,
          borderWidth:1, borderColor:'#F0EDE8',
        }}>
          <View style={{width:7,height:7,borderRadius:99,backgroundColor:'#16A34A'}}/>
          <Text style={{fontSize:11,fontWeight:'700',color:INK}}>Signed in New York</Text>
        </View>

      </View>
    </View>
  );
}

// ─── SLIDE 3 ──────────────────────────────────────────────────────────────────
const LIST_ITEMS = [
  {icon:'briefcase-outline',  ic:ORANGE,    bg:ORANGE_L,                  title:'Service Agreement',  sub:'Freelance · $4,800/mo',  status:'Signed', sc:'#16A34A', rating:'4.9 (24)'},
  {icon:'file-lock-outline',  ic:'#8B5CF6', bg:'rgba(139,92,246,0.12)',   title:'NDA — Acme Corp',    sub:'Confidentiality · NDA',  status:'Sent',   sc:'#F59E0B', rating:'4.7 (10)'},
  {icon:'currency-usd',       ic:'#10B981', bg:'rgba(16,185,129,0.12)',   title:'Payment Agreement',  sub:'Net-30 · $12,000 total', status:'Draft',  sc:'#8B5CF6', rating:'4.8 (18)'},
];

function TimelineArtifact() {
  return (
    <View style={[{width:CONTENT_W,borderRadius:20,backgroundColor:WHITE,overflow:'hidden'}, CARD_SHADOW]}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#F0EDE8'}}>
        <Text style={{fontSize:15,fontWeight:'800',color:INK,letterSpacing:-0.3}}>My Contracts</Text>
        <View style={{backgroundColor:ORANGE_L,borderRadius:99,paddingHorizontal:10,paddingVertical:4,borderWidth:1,borderColor:'rgba(255,92,40,0.2)'}}>
          <Text style={{fontSize:9,fontWeight:'800',color:ORANGE,letterSpacing:0.5}}>3 ACTIVE</Text>
        </View>
      </View>

      {LIST_ITEMS.map((item,i)=>(
        <View key={i} style={[
          {flexDirection:'row',alignItems:'center',paddingHorizontal:14,paddingVertical:13,gap:12},
          i>0&&{borderTopWidth:1,borderTopColor:'#F4F2EF'},
        ]}>
          <View style={{width:46,height:46,borderRadius:13,backgroundColor:item.bg,alignItems:'center',justifyContent:'center'}}>
            <Icon name={item.icon} size={20} color={item.ic}/>
          </View>
          <View style={{flex:1}}>
            <Text style={{fontSize:13,fontWeight:'700',color:INK,marginBottom:3}}>{item.title}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:4}}>
              <Icon name="star" size={10} color="#F59E0B"/>
              <Text style={{fontSize:11,color:GRAY}}>{item.rating} · {item.sub}</Text>
            </View>
          </View>
          <View style={{alignItems:'flex-end',gap:5}}>
            <View style={{borderRadius:99,borderWidth:1,borderColor:item.sc+'55',paddingHorizontal:7,paddingVertical:2}}>
              <Text style={{fontSize:8,fontWeight:'800',color:item.sc,letterSpacing:0.4,textTransform:'uppercase'}}>{item.status}</Text>
            </View>
            <Icon name="arrow-top-right" size={13} color={GRAY_L}/>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── Slides ───────────────────────────────────────────────────────────────────
const SLIDES = [
  {key:'1', headline:'Contracts,\nInstantly.',   body:'Describe it in plain English. AI generates a complete, legally-sound contract in seconds.', Artifact:ContractArtifact},
  {key:'2', headline:'Sign from\nAnywhere.',     body:'Send contracts and collect legally binding signatures — any device, anywhere in the world.', Artifact:MapArtifact},
  {key:'3', headline:'Nothing\nFalls Through.',  body:'Know the moment a contract is opened or signed. Every step tracked and timestamped.',        Artifact:TimelineArtifact},
];

// ─── Text entrance ────────────────────────────────────────────────────────────
function useEntrance() {
  const opacity    = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  const trigger = useCallback(() => {
    opacity.setValue(0); translateY.setValue(16);
    Animated.parallel([
      Animated.timing(opacity,    {toValue:1,duration:380,useNativeDriver:true}),
      Animated.timing(translateY, {toValue:0,duration:380,useNativeDriver:true}),
    ]).start();
  },[]);
  return {opacity, translateY, trigger};
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function OnboardingScreen({navigation}: {
  navigation: NativeStackNavigationProp<PreAuthStackParamList, 'Onboarding'>;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef  = useRef<FlatList>(null);
  const setHasSeenOnboarding = useAuthStore(s => s.setHasSeenOnboarding);
  const entrance = useEntrance();
  const insets   = useSafeAreaInsets();
  const slideH   = height - TOPBAR_H - FOOTER_H - insets.top - insets.bottom;

  useEffect(()=>{ entrance.trigger(); },[]);

  const onViewableItemsChanged = useRef(({viewableItems}:{viewableItems:ViewToken[]})=>{
    if(viewableItems.length>0 && viewableItems[0].index!=null){
      setActiveIndex(viewableItems[0].index);
      entrance.trigger();
    }
  }).current;

  const handleStart = () => { setHasSeenOnboarding(true); navigation.navigate('EmailEntry'); };
  const goNext = () => activeIndex < SLIDES.length-1
    ? flatRef.current?.scrollToIndex({index:activeIndex+1, animated:true})
    : handleStart();

  return (
    <View style={sc.root}>
      <StatusBar barStyle="dark-content" backgroundColor={BG}/>
      <SafeAreaView style={sc.safe} edges={['top','bottom']}>

        <View style={sc.topBar}>
          <View style={sc.logoWrap} pointerEvents="none">
            <Image source={require('@/assets/clerra-logo.png')} style={sc.logoImg} resizeMode="contain"/>
          </View>
          <TouchableOpacity onPress={handleStart} hitSlop={{top:14,bottom:14,left:14,right:14}}>
            <Text style={sc.skip}>Skip</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatRef}
          data={SLIDES}
          keyExtractor={i=>i.key}
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{itemVisiblePercentThreshold:60}}
          style={{height:slideH,flexGrow:0}}
          renderItem={({item})=>(
            <View style={[sc.slide,{height:slideH}]}>
              <DotGrid/>
              <View style={sc.artWrap}><item.Artifact/></View>
              <Animated.View style={[sc.textBlock,{opacity:entrance.opacity,transform:[{translateY:entrance.translateY}]}]}>
                <Text style={sc.headline}>{item.headline}</Text>
                <Text style={sc.body}>{item.body}</Text>
              </Animated.View>
            </View>
          )}
        />

        <View style={sc.footer}>
          <View style={sc.dots}>
            {SLIDES.map((_,i)=><View key={i} style={[sc.dot, i===activeIndex&&sc.dotActive]}/>)}
          </View>
          <TouchableOpacity style={sc.btn} onPress={goNext} activeOpacity={0.88}>
            <Text style={sc.btnText}>{activeIndex===SLIDES.length-1?'Get Started':'Continue'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleStart} activeOpacity={0.6} hitSlop={{top:10,bottom:10,left:20,right:20}}>
            <Text style={sc.signIn}>Already have an account?{'  '}<Text style={sc.signInLink}>Sign in</Text></Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}

const sc = StyleSheet.create({
  root:  {flex:1,backgroundColor:BG},
  safe:  {flex:1},
  topBar:{height:TOPBAR_H,flexDirection:'row',alignItems:'center',justifyContent:'flex-end',paddingHorizontal:24},
  logoWrap:{position:'absolute',left:0,right:0,alignItems:'center'},
  logoImg:{height:40,width:140},
  skip:  {fontSize:14,color:GRAY,fontWeight:'500'},
  slide: {width,paddingHorizontal:24},
  artWrap:{flex:1,alignItems:'center',justifyContent:'center'},
  textBlock:{paddingBottom:20},
  headline:{fontSize:38,fontWeight:'800',color:INK,letterSpacing:-1.6,lineHeight:43,marginBottom:12,textAlign:'center'},
  body:  {fontSize:15,color:GRAY,lineHeight:22,textAlign:'center',paddingHorizontal:12},
  footer:{height:FOOTER_H,paddingHorizontal:24,paddingTop:12,paddingBottom:8,alignItems:'center',gap:14},
  dots:  {flexDirection:'row',gap:6},
  dot:   {width:6,height:6,borderRadius:99,backgroundColor:GRAY_L},
  dotActive:{width:22,backgroundColor:ORANGE},
  btn:   {width:'100%',backgroundColor:ORANGE,borderRadius:99,paddingVertical:18,alignItems:'center',shadowColor:ORANGE,shadowOffset:{width:0,height:6},shadowOpacity:0.35,shadowRadius:18,elevation:8},
  btnText:{color:WHITE,fontSize:17,fontWeight:'700',letterSpacing:-0.3},
  signIn:{color:GRAY,fontSize:13,textAlign:'center'},
  signInLink:{color:ORANGE,fontWeight:'700'},
});
