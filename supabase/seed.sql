-- FORGE tracker — seed data
-- Run this once, after schema.sql, in the Supabase SQL Editor.

insert into program (id, days) values ('default', $$
[
  {"id":"d1","weekday":"Lundi","title":"Full Body A","type":"muscu",
   "exercises":[
     {"id":"d1e1","name":"Squat","muscleGroup":"jambes","type":"muscu","targetSets":3,"targetReps":"6"},
     {"id":"d1e2","name":"DD barre","muscleGroup":"pecs","type":"muscu","targetSets":3,"targetReps":"6"},
     {"id":"d1e3","name":"Tirage vertical","muscleGroup":"dos","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d1e4","name":"Tirage horizontal unilatéral","muscleGroup":"dos","type":"muscu","targetSets":3,"targetReps":"10"},
     {"id":"d1e5","name":"Élévations latérales","muscleGroup":"epaules","type":"muscu","targetSets":2,"targetReps":"12-15"},
     {"id":"d1e6","name":"Extensions poulie uni","muscleGroup":"bras","type":"muscu","targetSets":2,"targetReps":"12-15"}
   ],
   "mobility":[
     {"id":"d1m1","name":"90/90","detail":"5 transitions/côté"},
     {"id":"d1m2","name":"Lizard pose","detail":"30s/côté"},
     {"id":"d1m3","name":"Posterior pelvic tilt actif","detail":"10 reps"},
     {"id":"d1m4","name":"Extension thoracique au manche","detail":"8-10 reps"},
     {"id":"d1m5","name":"Halo KB léger","detail":"5/sens"}
   ]},
  {"id":"d2","weekday":"Mardi","title":"Boxe A","type":"boxe",
   "exercises":[
     {"id":"d2e1","name":"Travail au sac","muscleGroup":"cardio","type":"cardio","targetSets":4,"targetReps":"3min"},
     {"id":"d2e2","name":"Landmine Press debout","muscleGroup":"epaules","type":"muscu","targetSets":3,"targetReps":"8"},
     {"id":"d2e3","name":"Crunch poulie haute","muscleGroup":"abdos","type":"muscu","targetSets":3,"targetReps":"10"},
     {"id":"d2e4","name":"Roulette","muscleGroup":"abdos","type":"muscu","targetSets":3,"targetReps":"6-8"},
     {"id":"d2e5","name":"Pivot barre","muscleGroup":"abdos","type":"muscu","targetSets":2,"targetReps":"8-10"},
     {"id":"d2e6","name":"Pivot poids genoux","muscleGroup":"abdos","type":"muscu","targetSets":2,"targetReps":"8-10"},
     {"id":"d2e7","name":"KB dead bug","muscleGroup":"abdos","type":"muscu","targetSets":2,"targetReps":"10"},
     {"id":"d2e8","name":"Reverse plank banc uni","muscleGroup":"abdos","type":"muscu","targetSets":2,"targetReps":"8/côté"},
     {"id":"d2e9","name":"Cou","muscleGroup":"cou","type":"note"},
     {"id":"d2e10","name":"Battle ropes","muscleGroup":"cardio","type":"cardio","targetSets":6,"targetReps":"20s/40s"}
   ],
   "mobility":[
     {"id":"d2m1","name":"Side lunge","detail":"6-8/côté"},
     {"id":"d2m2","name":"Deep squat hold","detail":"30s"},
     {"id":"d2m3","name":"Halo KB léger","detail":"5/sens"},
     {"id":"d2m4","name":"Mobilité épaules","detail":"vidéo Insta"},
     {"id":"d2m5","name":"Coiffe rotateurs poulie uni","detail":"avant/arrière"}
   ]},
  {"id":"d3","weekday":"Mercredi","title":"Full Body B","type":"muscu",
   "exercises":[
     {"id":"d3e1","name":"SDT","muscleGroup":"jambes","type":"muscu","targetSets":4,"targetReps":"5-6"},
     {"id":"d3e2","name":"Landmine squat push","muscleGroup":"jambes","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d3e3","name":"Rowing barre libre","muscleGroup":"dos","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d3e4","name":"DI haltères","muscleGroup":"pecs","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d3e5","name":"DM","muscleGroup":"epaules","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d3e6","name":"Curl machine","muscleGroup":"bras","type":"muscu","targetSets":2,"targetReps":"12-15"}
   ],
   "mobility":[
     {"id":"d3m1","name":"Roulement rouleau haut du dos","detail":"45-60s"},
     {"id":"d3m2","name":"Chin tuck","detail":"8-10 reps"},
     {"id":"d3m3","name":"Deep squat hold","detail":"30-45s"},
     {"id":"d3m4","name":"Cossack squat + rotation thoracique","detail":"6-8/côté"},
     {"id":"d3m5","name":"Mobilité épaules","detail":"vidéo Insta"}
   ]},
  {"id":"d4","weekday":"Jeudi","title":"Cardio / Spé","type":"boxe",
   "exercises":[
     {"id":"d4e1","name":"Cordes à sauter","muscleGroup":"cardio","type":"cardio","targetSets":4,"targetReps":"3min/1min repos"},
     {"id":"d4e2","name":"Landmine push","muscleGroup":"epaules","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d4e3","name":"Hammer strike","muscleGroup":"cardio","type":"cardio","targetSets":3,"targetReps":"1min"},
     {"id":"d4e4","name":"KB dead bug","muscleGroup":"abdos","type":"muscu","targetSets":2,"targetReps":"8-10"},
     {"id":"d4e5","name":"Russian twist","muscleGroup":"abdos","type":"muscu","targetSets":2,"targetReps":"20"},
     {"id":"d4e6","name":"Gainage côté actif","muscleGroup":"abdos","type":"muscu","targetSets":2,"targetReps":"8-10/côté"},
     {"id":"d4e7","name":"S-tier obliques banc KB","muscleGroup":"abdos","type":"muscu","targetSets":2,"targetReps":"10"},
     {"id":"d4e8","name":"Cou","muscleGroup":"cou","type":"note"}
   ],
   "mobility":[
     {"id":"d4m1","name":"Side lunge","detail":"6-8/côté"},
     {"id":"d4m2","name":"Deep squat hold","detail":"30s"},
     {"id":"d4m3","name":"Halo KB léger","detail":"5/sens"},
     {"id":"d4m4","name":"Mobilité épaules","detail":"vidéo Insta"}
   ]},
  {"id":"d5","weekday":"Vendredi","title":"Boxe B","type":"boxe",
   "exercises":[
     {"id":"d5e1","name":"Travail au sac","muscleGroup":"cardio","type":"cardio","targetSets":4,"targetReps":"3min"},
     {"id":"d5e2","name":"Med ball rotation","muscleGroup":"abdos","type":"muscu","targetSets":3,"targetReps":"8"},
     {"id":"d5e3","name":"KB swing","muscleGroup":"jambes","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d5e4","name":"Crunch poulie haute","muscleGroup":"abdos","type":"muscu","targetSets":3,"targetReps":"10"},
     {"id":"d5e5","name":"Roulette","muscleGroup":"abdos","type":"muscu","targetSets":3,"targetReps":"6-8"},
     {"id":"d5e6","name":"Skierg","muscleGroup":"cardio","type":"cardio","targetSets":5,"targetReps":"2min/1min repos"}
   ],
   "mobility":[
     {"id":"d5m1","name":"Side lunge","detail":"6-8/côté"},
     {"id":"d5m2","name":"Deep squat hold","detail":"30s"},
     {"id":"d5m3","name":"Halo KB léger","detail":"5/sens"},
     {"id":"d5m4","name":"Mobilité épaules","detail":"vidéo Insta"},
     {"id":"d5m5","name":"Coiffe rotateurs poulie uni","detail":"avant/arrière"}
   ]},
  {"id":"d6","weekday":"Samedi","title":"Full Body C","type":"muscu",
   "exercises":[
     {"id":"d6e1","name":"Bench classique barre","muscleGroup":"pecs","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d6e2","name":"Rear delt fly","muscleGroup":"epaules","type":"muscu","targetSets":3,"targetReps":"12-15"},
     {"id":"d6e3","name":"Pec fly","muscleGroup":"pecs","type":"muscu","targetSets":3,"targetReps":"12-15"},
     {"id":"d6e4","name":"Tractions","muscleGroup":"dos","type":"muscu","targetSets":3,"targetReps":"8"},
     {"id":"d6e5","name":"Fente bulgare","muscleGroup":"jambes","type":"muscu","targetSets":3,"targetReps":"8-10"},
     {"id":"d6e6","name":"Dips machine","muscleGroup":"bras","type":"muscu","targetSets":2,"targetReps":"12-15"},
     {"id":"d6e7","name":"Curl poulie basse","muscleGroup":"bras","type":"muscu","targetSets":2,"targetReps":"12-15"}
   ],
   "mobility":[
     {"id":"d6m1","name":"Roulement rouleau haut du dos","detail":"45s"},
     {"id":"d6m2","name":"Deep squat hold","detail":"30s"},
     {"id":"d6m3","name":"Chin tuck","detail":"8-10 reps"},
     {"id":"d6m4","name":"Halo KB léger","detail":"5/sens"},
     {"id":"d6m5","name":"Mobilité épaules","detail":"vidéo Insta"}
   ]},
  {"id":"d7","weekday":"Dimanche","title":"Repos","type":"repos","exercises":[],"mobility":[]}
]
$$::jsonb)
on conflict (id) do update set days = excluded.days;

insert into exercise_library (id, items) values ('default', $$
[
  {"name":"Squat","muscleGroup":"jambes"},{"name":"SDT","muscleGroup":"jambes"},{"name":"Hip thrust","muscleGroup":"jambes"},
  {"name":"Leg curl","muscleGroup":"jambes"},{"name":"Leg press","muscleGroup":"jambes"},{"name":"Fente bulgare","muscleGroup":"jambes"},
  {"name":"Hack squat","muscleGroup":"jambes"},{"name":"Landmine squat push","muscleGroup":"jambes"},{"name":"Jump squat","muscleGroup":"jambes"},
  {"name":"KB swing","muscleGroup":"jambes"},{"name":"DD barre","muscleGroup":"pecs"},{"name":"Bench classique barre","muscleGroup":"pecs"},
  {"name":"Bench décliné","muscleGroup":"pecs"},{"name":"DI haltères","muscleGroup":"pecs"},{"name":"Pec fly","muscleGroup":"pecs"},
  {"name":"Pompes","muscleGroup":"pecs"},{"name":"Tractions","muscleGroup":"dos"},{"name":"Tirage vertical","muscleGroup":"dos"},
  {"name":"Traction supination","muscleGroup":"dos"},{"name":"Rowing BI","muscleGroup":"dos"},{"name":"Rowing barre libre","muscleGroup":"dos"},
  {"name":"Tirage horizontal unilatéral","muscleGroup":"dos"},{"name":"Tirage horizontal deux bras","muscleGroup":"dos"},
  {"name":"Face pull","muscleGroup":"dos"},{"name":"DM","muscleGroup":"epaules"},{"name":"Élévations latérales","muscleGroup":"epaules"},
  {"name":"Rear delt fly","muscleGroup":"epaules"},{"name":"Oiseau BI","muscleGroup":"epaules"},{"name":"Shrug","muscleGroup":"epaules"},
  {"name":"Landmine Press debout","muscleGroup":"epaules"},{"name":"Landmine push","muscleGroup":"epaules"},
  {"name":"Rotation externe poulie","muscleGroup":"epaules"},{"name":"Extensions poulie uni","muscleGroup":"bras"},
  {"name":"Dips machine","muscleGroup":"bras"},{"name":"Curl machine","muscleGroup":"bras"},{"name":"Curl poulie cordes","muscleGroup":"bras"},
  {"name":"Curl poulie basse","muscleGroup":"bras"},{"name":"Curl poulie","muscleGroup":"bras"},{"name":"Extensions triceps","muscleGroup":"bras"},
  {"name":"Crunch poulie haute","muscleGroup":"abdos"},{"name":"Roulette","muscleGroup":"abdos"},{"name":"Crunch inversés","muscleGroup":"abdos"},
  {"name":"Pivot barre","muscleGroup":"abdos"},{"name":"Pivot poids genoux","muscleGroup":"abdos"},{"name":"KB dead bug","muscleGroup":"abdos"},
  {"name":"Reverse plank banc uni","muscleGroup":"abdos"},{"name":"Gainage côté actif","muscleGroup":"abdos"},
  {"name":"S-tier obliques banc KB","muscleGroup":"abdos"},{"name":"Russian twist","muscleGroup":"abdos"},{"name":"Pallof press","muscleGroup":"abdos"},
  {"name":"Halo KB","muscleGroup":"abdos"},{"name":"Med ball rotation","muscleGroup":"abdos"},{"name":"Push rack","muscleGroup":"epaules"},
  {"name":"Hammer strike","muscleGroup":"cardio"},{"name":"Barbell push out","muscleGroup":"pecs"},{"name":"Snatch KB","muscleGroup":"jambes"},
  {"name":"Travail au sac","muscleGroup":"cardio"},{"name":"Shadow boxing","muscleGroup":"cardio"},{"name":"Battle ropes","muscleGroup":"cardio"},
  {"name":"Cordes à sauter","muscleGroup":"cardio"},{"name":"Skierg","muscleGroup":"cardio"},{"name":"Roadwork","muscleGroup":"cardio"},
  {"name":"Sprint","muscleGroup":"cardio"},{"name":"Assault bike","muscleGroup":"cardio"}
]
$$::jsonb)
on conflict (id) do update set items = excluded.items;
