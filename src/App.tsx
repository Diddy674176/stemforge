import { useState } from 'react';
import { useStemForge } from './hooks/useStemForge';
import { RightsBanner } from './components/RightsBanner';
import { ProjectBar } from './components/ProjectBar';
import { SourcesPanel } from './components/SourcesPanel';
import { Timeline } from './components/Timeline';
import { Mixer } from './components/Mixer';
import { Transport } from './components/Transport';
import { SimpleStudio } from './components/SimpleStudio';

export default function App() {
  const sf = useStemForge();
  const [vocalsId, setVocalsId] = useState('');
  const [beatId, setBeatId] = useState('');
  const [melodyId, setMelodyId] = useState('');
  const [advanced, setAdvanced] = useState(false);

  return (
    <div className={`studio ${advanced ? 'mode-advanced' : 'mode-simple'}`}>
      {!sf.rightsAccepted && (
        <RightsBanner onAccept={() => sf.setRightsAccepted(true)} />
      )}
      <ProjectBar
        project={sf.project}
        busy={sf.busy}
        advanced={advanced}
        savedList={sf.savedList}
        onName={(n) => sf.setProject((p) => ({ ...p, name: n }))}
        onSave={sf.saveProject}
        onLoad={sf.loadSaved}
        onExportWav={() => sf.exportMix('wav')}
        onExportMp3={() => sf.exportMix('mp3')}
        onImport={(files) => files && sf.importFiles(files)}
        onToggleAdvanced={() => setAdvanced((v) => !v)}
      />

      {!advanced ? (
        <SimpleStudio
          sources={sf.project.sources}
          selectedStem={sf.selectedStem}
          clipsCount={sf.project.clips.length}
          status={sf.status}
          busy={sf.busy}
          playing={sf.playing}
          playhead={sf.playhead}
          duration={sf.duration}
          vocalsId={vocalsId}
          beatId={beatId}
          melodyId={melodyId}
          proposals={sf.proposals}
          onImport={(files) => sf.importFiles(files)}
          onVocals={setVocalsId}
          onBeat={setBeatId}
          onMelody={setMelodyId}
          onAutoSync={() => sf.autoSyncBeginner(vocalsId, beatId, melodyId || null)}
          onSmartRemix={sf.runSmartRemix}
          onLoadProposal={sf.loadProposal}
          onSelectStem={sf.selectStem}
          onVolume={(id, volume) => sf.updateStem(id, { volume })}
          onMute={(id, muted) => sf.updateStem(id, { muted })}
          onPlay={sf.play}
          onPause={sf.pause}
          onStop={sf.stop}
        />
      ) : (
        <>
          <div className="studio-main">
            <SourcesPanel
              sources={sf.project.sources}
              selectedStemId={sf.project.selectedStemId}
              beginnerMode
              vocalsId={vocalsId}
              beatId={beatId}
              melodyId={melodyId}
              proposals={sf.proposals}
              busy={sf.busy}
              onSelectStem={sf.selectStem}
              onAddStem={sf.addStemToTimeline}
              onMute={(id, muted) => sf.updateStem(id, { muted })}
              onSolo={(id, solo) => sf.updateStem(id, { solo })}
              onExportStem={(stem) => sf.exportStem(stem, 'wav')}
              onPreview={sf.previewStem}
              onVocals={setVocalsId}
              onBeat={setBeatId}
              onMelody={setMelodyId}
              onAutoSync={() => sf.autoSyncBeginner(vocalsId, beatId, melodyId || null)}
              onSmartRemix={sf.runSmartRemix}
              onLoadProposal={sf.loadProposal}
            />
            <Timeline
              project={sf.project}
              stems={sf.allStems}
              playhead={sf.playhead}
              duration={sf.duration}
              onSeek={sf.seek}
              onMoveClip={sf.moveClip}
              onSelectClip={(id) => sf.setProject((p) => ({ ...p, selectedClipId: id }))}
              onSplitClip={sf.splitClip}
              onDeleteClip={sf.deleteClip}
              onZoom={(z) => sf.setProject((p) => ({ ...p, zoom: z }))}
            />
            <Mixer
              stem={sf.selectedStem}
              master={sf.project.master}
              onStemChange={sf.updateStem}
              onMasterPreset={sf.applyMasterPreset}
              onMasterPatch={(patch) =>
                sf.setProject((p) => ({ ...p, master: { ...p.master, ...patch } }))
              }
              onAiMix={sf.aiMix}
            />
          </div>
          <Transport
            playing={sf.playing}
            playhead={sf.playhead}
            duration={sf.duration}
            bpm={sf.project.bpm}
            metronome={sf.project.metronome}
            snap={sf.project.snap}
            autoHarmonic={sf.project.autoHarmonicMatch}
            onPlay={sf.play}
            onPause={sf.pause}
            onStop={sf.stop}
            onSeek={sf.seek}
            onMetronome={(on) => sf.setProject((p) => ({ ...p, metronome: on }))}
            onSnap={(snap) => sf.setProject((p) => ({ ...p, snap }))}
            onAutoHarmonic={(on) => sf.setProject((p) => ({ ...p, autoHarmonicMatch: on }))}
          />
        </>
      )}
    </div>
  );
}
