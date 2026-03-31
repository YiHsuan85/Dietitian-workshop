import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, Activity, ClipboardList, Utensils, Plus, Trash2, 
  Save, Calculator, AlertCircle, CheckSquare, FileText, Coffee, Dumbbell
} from 'lucide-react';

/** * 營養參數資料庫 (可移至獨立的 constants.js)
 */
const EXCHANGE_VALUES = {
  '低脂乳品類': { carbs: 12, protein: 8, fat: 4, calories: 120, na: 120, k: 380, p: 250 },
  '全脂乳品類': { carbs: 12, protein: 8, fat: 8, calories: 150, na: 110, k: 350, p: 230 },
  '全榖雜糧類': { carbs: 15, protein: 2, fat: 0, calories: 70, na: 2, k: 30, p: 30 },
  '低氮澱粉': { carbs: 15, protein: 0, fat: 0, calories: 60, na: 1, k: 5, p: 5 },
  '低脂豆魚蛋肉類': { carbs: 0, protein: 7, fat: 3, calories: 55, na: 50, k: 100, p: 80 },
  '中脂豆魚蛋肉類': { carbs: 0, protein: 7, fat: 5, calories: 75, na: 60, k: 120, p: 100 },
  '高脂豆魚蛋肉類': { carbs: 0, protein: 7, fat: 10, calories: 120, na: 70, k: 110, p: 90 },
  '蔬菜類': { carbs: 5, protein: 1, fat: 0, calories: 25, na: 15, k: 200, p: 30 },
  '水果類': { carbs: 15, protein: 0, fat: 0, calories: 60, na: 2, k: 150, p: 15 },
  '油脂與堅果類': { carbs: 0, protein: 0, fat: 5, calories: 45, na: 1, k: 10, p: 5 },
  '外食類': { carbs: 20, protein: 5, fat: 10, calories: 190, na: 400, k: 150, p: 100 },
  '醬料類': { carbs: 5, protein: 0, fat: 0, calories: 20, na: 500, k: 50, p: 20 },
  '保健品': { carbs: 0, protein: 0, fat: 0, calories: 0, na: 0, k: 0, p: 0 }
};

const INTERVENTION_PRESETS = {
  'DM': {
    '1200': { '低脂乳品類': 1.5, '全榖雜糧類': 7.5, '中脂豆魚蛋肉類': 2, '蔬菜類': 3, '水果類': 2, '油脂與���果類': 2.5 },
    '1500': { '低脂乳品類': 1.5, '全榖雜糧類': 10, '中脂豆魚蛋肉類': 3, '蔬菜類': 4, '水果類': 2, '油脂與堅果類': 4 },
    '1800': { '低脂乳品類': 1.5, '全榖雜糧類': 12, '中脂豆魚蛋肉類': 3.5, '蔬菜類': 4, '水果類': 3, '油脂與堅果類': 5 }
  },
  'CKD': {
    '1500': { '全榖雜糧類': 8, '低氮澱粉': 3.5, '中脂豆魚蛋肉類': 3, '蔬菜類': 3, '水果類': 2, '油脂與堅果類': 7 },
    '1800': { '全榖雜糧類': 10, '低氮澱粉': 5, '中脂豆魚蛋肉類': 3.5, '蔬菜類': 3, '水果類': 2, '油脂與堅果類': 8 }
  }
};

const FOOD_DATABASE = [
  { name: '全脂牛奶 240 cc', category: '全脂乳品類', carbs: 12, protein: 8, fat: 8 },
  { name: '低脂牛奶 240 cc', category: '低脂乳品類', carbs: 12, protein: 8, fat: 4 },
  { name: '雞胸肉 30g', category: '低脂豆魚蛋肉類', carbs: 0, protein: 7, fat: 3 },
  { name: '白飯 40g(1/4碗)', category: '全榖雜糧類', carbs: 15, protein: 2, fat: 0 },
  { name: '高麗菜', category: '蔬菜類', carbs: 5, protein: 1, fat: 0 },
  { name: '富士蘋果1顆', category: '水果類', carbs: 15, protein: 0, fat: 0 },
  { name: '植物油5g', category: '油脂與堅果類', carbs: 0, protein: 0, fat: 5 },
  { name: '珍珠奶茶(微糖)', category: '外食類', carbs: 13.5, protein: 0.2, fat: 2.3 }
  // ... 其他數據已精簡，可依需求補回
];

const MEALS = ['早餐', '早點', '午餐', '午點', '晚餐', '晚點'];
const FOOD_TYPES = Object.keys(EXCHANGE_VALUES);
const EXERCISE_TYPES = ['排球', '羽毛球', '爬山', '腳踏車', '游泳', '快走', '慢跑'];
const INTERVENTION_CATEGORIES = ['低脂乳品類', '全脂乳品類', '全榖雜糧類', '低氮澱粉', '低脂豆魚蛋肉類', '中脂豆魚蛋肉類', '蔬菜類', '水果類', '油脂與堅果類'];

export default function NutritionApp() {
  // --- 狀態管理 ---
  const [patientInfo, setPatientInfo] = useState({
    name: '', birthday: '', gender: '男', height: '', weight: '', activityLevel: '無',
    social: { living: '', work: '' },
    exercise: { frequency: '', time: '', types: [] },
    otherDietAssessment: ''
  });

  const [biochemical, setBiochemical] = useState({
    HbA1c: '', TG: '', HDL: '', LDL: '', Chol: '', Na: '', K: '', P: '', uricAcid: '', alb: '', UPCR: '', AC: ''
  });

  const [dietTable, setDietTable] = useState(
    FOOD_TYPES.reduce((acc, type) => {
      acc[type] = MEALS.reduce((mealAcc, meal) => { mealAcc[meal] = 0; return mealAcc; }, {});
      return acc;
    }, {})
  );

  const [quickInput, setQuickInput] = useState({ category: '', foodName: '', meal: '早餐', portions: 1 });
  const [pesRecords, setPesRecords] = useState([{ problem: '', etiology: '', symptoms: '' }]);
  const [intervention, setIntervention] = useState({ targetCalories: '1200', mealCount: 3, condition: '', otherAdvice: '' });

  const [interventionPortions, setInterventionPortions] = useState(
    INTERVENTION_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = { total: 0, meals: MEALS.reduce((mAcc, m) => { mAcc[m] = 0; return mAcc; }, {}) };
      return acc;
    }, {})
  );

  // --- 計算邏輯 (Memoized) ---
  const uniqueCategories = useMemo(() => [...new Set(FOOD_DATABASE.map(f => f.category))].sort(), []);
  const filteredFoods = useMemo(() => {
    return quickInput.category ? FOOD_DATABASE.filter(f => f.category === quickInput.category) : [];
  }, [quickInput.category]);

  const metrics = useMemo(() => {
    const h = parseFloat(patientInfo.height) || 0;
    const w = parseFloat(patientInfo.weight) || 0;
    const bday = new Date(patientInfo.birthday);
    const age = patientInfo.birthday ? (new Date().getFullYear() - bday.getFullYear()) : 0;
    const bmi = h > 0 ? (w / Math.pow(h/100, 2)).toFixed(1) : 0;
    const ibw = h > 0 ? (22 * Math.pow(h/100, 2)).toFixed(1) : 0;
    const activityFactor = patientInfo.activityLevel === '重度' ? 40 : (patientInfo.activityLevel === '中度' ? 35 : 30);
    return { age, bmi, ibw, reqKcal: ibw > 0 ? (ibw * activityFactor).toFixed(0) : 0 };
  }, [patientInfo]);

  const dietTotals = useMemo(() => {
    let totals = { carbs: 0, protein: 0, fat: 0, calories: 0 };
    Object.entries(dietTable).forEach(([type, meals]) => {
      const ex = EXCHANGE_VALUES[type];
      const portions = Object.values(meals).reduce((s, v) => s + (parseFloat(v) || 0), 0);
      totals.carbs += portions * ex.carbs;
      totals.protein += portions * ex.protein;
      totals.fat += portions * ex.fat;
      totals.calories += portions * ex.calories;
    });
    return totals;
  }, [dietTable]);

  // --- 自動分配函數 ---
  const distributeToMeals = (total, category, mealCount) => {
    const val = parseFloat(total) || 0;
    const breakdown = MEALS.reduce((acc, m) => { acc[m] = 0; return acc; }, {});
    if (val <= 0) return breakdown;
    
    const activeIndices = [0, 2, 4]; // 基本早午晚
    const activeMeals = activeIndices.map(i => MEALS[i]);
    activeMeals.forEach(m => breakdown[m] = (val / activeMeals.length).toFixed(1));
    return breakdown;
  };

  // --- 處理事件 ---
  const handleQuickAdd = () => {
    const match = FOOD_DATABASE.find(f => f.name === quickInput.foodName);
    if (match) {
      setDietTable(prev => ({
        ...prev,
        [match.category]: {
          ...prev[match.category],
          [quickInput.meal]: (parseFloat(prev[match.category][quickInput.meal]) || 0) + parseFloat(quickInput.portions)
        }
      }));
      setQuickInput(p => ({ ...p, foodName: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800 pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">營養諮詢紀錄系統</h1>
        </header>

        {/* 第一部分：營養評估 */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-6 border-b-2 pb-2 text-indigo-700 border-indigo-200">
            <User size={24}/><h2 className="text-xl font-bold">一、營養評估</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>姓名<input className="w-full border p-2 rounded mt-1" value={patientInfo.name} onChange={e=>setPatientInfo({...patientInfo, name:e.target.value})} /></div>
                <div>生日<input type="date" className="w-full border p-2 rounded mt-1" value={patientInfo.birthday} onChange={e=>setPatientInfo({...patientInfo, birthday:e.target.value})} /></div>
                <div>BMI <div className="p-2 bg-slate-50 border rounded mt-1 font-bold text-center">{metrics.bmi}</div></div>
                <div>建議熱量 <div className="p-2 bg-indigo-50 text-indigo-700 border rounded mt-1 font-bold text-center">{metrics.reqKcal}</div></div>
              </div>
            </div>
            <div className="bg-rose-50 p-6 rounded-xl border border-rose-100 flex flex-col justify-center text-center">
              <Calculator className="mx-auto mb-2 text-rose-500" />
              <p className="text-xs font-bold text-rose-400 uppercase">評估狀態</p>
              <p className="text-2xl font-black text-rose-600">{metrics.bmi > 24 ? '體重過重' : '正常範圍'}</p>
            </div>
          </div>
        </section>

        {/* 飲食紀錄區 */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-12 border-t-4 border-t-emerald-500">
          <h3 className="text-xl font-bold text-slate-700 border-l-4 border-emerald-500 pl-2 mb-6">飲食評估紀錄</h3>
          
          <div className="flex flex-wrap gap-4 mb-6 bg-slate-50 p-4 rounded-xl items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-slate-400">食物種類</label>
              <select className="w-full border p-2 rounded bg-white" value={quickInput.category} onChange={e=>setQuickInput({...quickInput, category: e.target.value})}>
                <option value="">選擇類別</option>
                {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-bold text-slate-400">搜尋食物</label>
              <select className="w-full border p-2 rounded bg-white" value={quickInput.foodName} onChange={e=>setQuickInput({...quickInput, foodName: e.target.value})}>
                <option value="">選擇食物</option>
                {filteredFoods.map(f => <option key={f.name} value={f.name}>{f.name}</option>)}
              </select>
            </div>
            <button onClick={handleQuickAdd} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700">
              <Plus size={18}/>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 border text-left sticky left-0 bg-slate-50">類別</th>
                  {MEALS.map(m => <th key={m} className="p-3 border">{m}</th>)}
                  <th className="p-3 border bg-indigo-50">熱量</th>
                </tr>
              </thead>
              <tbody>
                {FOOD_TYPES.map(type => (
                  <tr key={type} className="hover:bg-slate-50">
                    <td className="p-3 border font-bold text-left sticky left-0 bg-white">{type}</td>
                    {MEALS.map(m => (
                      <td key={m} className="p-1 border">
                        <input 
                          type="number" 
                          className="w-full text-center bg-transparent outline-none" 
                          value={dietTable[type][m] || ''} 
                          onChange={e => {
                            const val = parseFloat(e.target.value) || 0;
                            setDietTable(prev => ({...prev, [type]: {...prev[type], [m]: val}}));
                          }}
                        />
                      </td>
                    ))}
                    <td className="p-3 border font-bold text-indigo-600">
                      {(Object.values(dietTable[type]).reduce((s,v)=>s+v,0) * EXCHANGE_VALUES[type].calories).toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 固定底欄 */}
        <div className="fixed bottom-6 right-6 flex items-center gap-4 bg-white/95 backdrop-blur-sm border border-slate-200 p-4 rounded-3xl shadow-2xl z-50">
          <div className="px-4 border-r">
            <p className="text-[10px] font-bold text-slate-400 uppercase">當前攝取總熱量</p>
            <p className="text-xl font-black text-indigo-700">{dietTotals.calories.toFixed(0)} <span className="text-xs">kcal</span></p>
          </div>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-transform active:scale-95">
            <Save size={20}/> 儲存紀錄
          </button>
        </div>
      </div>
    </div>
  );
}