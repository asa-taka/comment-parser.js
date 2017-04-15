const Detector = require('../js/detector').LineClassDetector;

describe('detector', () => {

  describe('LineClassDetector', () => {

    it('classify string class', () => {
      const detector = new Detector({
        classes: [
          { name: 'A', pattern: /^A.*/ },
          { name: 'B', pattern: /^B.*/ },
        ],
      })
      expect(detector.detectClass('Apple')).toBe('A');
      expect(detector.detectClass('Bisco')).toBe('B');
    })

    it('classify by prior definition', () => {
      const detector = new Detector({
        classes: [
          { name: 'A1', pattern: /^A.*/ },
          { name: 'A2', pattern: /^A.*/ },
          { name: 'B1', pattern: /^B.*/ },
          { name: 'B2', pattern: /^B.*/ },
        ],
      })
      expect(detector.detectClass('Apple')).toBe('A1');
      expect(detector.detectClass('Bisco')).toBe('B1');
    })
  })
})
